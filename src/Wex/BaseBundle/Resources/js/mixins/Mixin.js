export default {
    name: 'mixin',

    methods: {
        app: {
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
                let mixins = this.mixins;
                let mixinsValues = Object.entries(mixins);
                let loops = 0;
                let loopsLimit = 100;
                let errorTrace = [];

                let step = () => {
                    let data = mixinsValues.shift();

                    if (data) {
                        if (loops++ > loopsLimit) {
                            console.error(errorTrace);
                            throw `Stopping more than ${loops} recursions during mixins invocation `
                            + `on method "${method}", stopping at ${data[0]}, see trace below.`;
                        } else if (loops > loopsLimit - 10) {
                            errorTrace.push(data);
                        }

                        let name = data[0];
                        let hooks = data[1].hooks;

                        let next = () => {
                            registry[name] = 'complete';
                            step();
                        };

                        if (hooks && hooks[group] && hooks[group][method]) {
                            let argsLocal = args.concat([registry, next]);

                            registry[name] = hooks[group][method].apply(
                                this,
                                argsLocal
                            );
                        }

                        // "wait" says to retry after processing other mixins.
                        if (registry[name] === 'wait') {
                            // Enqueue again.
                            mixinsValues.push(data);
                            step();
                        }
                        // "stop" allows to le mixin to relaunch process itself.
                        else if (registry[name] !== 'stop') {
                            next();
                        }
                    }
                    // No more mixin.
                    else {
                        callback && callback(registry);
                    }
                };

                step();
            },
        },
    },
};
