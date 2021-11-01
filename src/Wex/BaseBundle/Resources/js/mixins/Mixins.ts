import MixinInterface from "../interfaces/MixinInterface";
import AppService from "../class/AppService";
import MixinsAppService from "../class/MixinsAppService";

const service:MixinInterface = {
    name: 'mixins',

    service: class extends AppService {
        /**
         * Execute a hook until all ext do not return false.
         * Useful to manage order when processing : an ext can wait for
         * another one to be executed.
         *
         * The pre-last arg of callback will be a registry of ext statuses.
         * The last arg of callback well be a next() method in case of async operation.
         *
         * @param method
         * @param args
         * @param callback
         * @param group
         */
        invokeUntilComplete(method, group = 'app', args = [], callback) {
            let registry = {};
            let services = this.app.mixins;
            let servicesValues: [string, MixinInterface][] = Object.entries(services);
            let loops = 0;
            let loopsLimit = 100;
            let errorTrace = [];

            let step = () => {
                let data = servicesValues.shift();

                if (data) {
                    if (loops++ > loopsLimit) {
                        console.error(errorTrace);
                        throw `Stopping more than ${loops} recursions during services invocation `
                        + `on method "${method}", stopping at ${data[0]}, see trace below.`;
                    } else if (loops > loopsLimit - 10) {
                        errorTrace.push(data);
                    }

                    let name = data[0];
                    let hooks = data[1].hooks;

                    let next = () => {
                        registry[name] = MixinsAppService.LOAD_STATUS_COMPLETE;
                        step();
                    };

                    if (hooks && hooks[group] && hooks[group][method]) {
                        let argsLocal = args.concat([registry, next]);

                        registry[name] = hooks[group][method].apply(
                            this,
                            argsLocal
                        );
                    }

                    // "wait" says to retry after processing other services.
                    if (registry[name] === MixinsAppService.LOAD_STATUS_WAIT) {
                        // Enqueue again.
                        servicesValues.push(data);
                        step();
                    }
                    // "stop" allows to let service to relaunch process itself.
                    else if (registry[name] !== MixinsAppService.LOAD_STATUS_STOP) {
                        next();
                    }
                }
                // No more service.
                else {
                    callback && callback(registry);
                }
            };

            step();
        }
    }
};

export default service;
