import AppService from '../class/AppService';
import MixinsAppService from '../class/MixinsAppService';

export default class MixinsService extends AppService {
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
   * @param timeoutLimit
   * @param mixins
   */
  invokeUntilComplete(
    method,
    group = 'app',
    args = [],
    callback,
    timeoutLimit: number = 2000,
    mixins: AppService[] = null
  ) {
    let registry: { [key: string]: string } = {};
    mixins = mixins || (Object.values(this.app.services) as AppService[]);
    let loops: number = 0;
    let loopsLimit: number = 100;
    let errorTrace: AppService[] = [];
    let currentName: string = 'startup';

    let timeout = setTimeout(() => {
      throw `Mixins invocation timeout on method "${method}", stopping at "${currentName}".`;
    }, timeoutLimit);

    let step = () => {
      let service: AppService = mixins.shift() as AppService;

      if (service) {
        currentName = service.name;
        let hooks = service.registerHooks();

        if (loops++ > loopsLimit) {
          console.error(errorTrace);
          console.error(registry);
          throw (
            `Stopping more than ${loops} recursions during services invocation ` +
            `on method "${method}", stopping at ${currentName}, see trace below.`
          );
        } else if (loops > loopsLimit - 10) {
          errorTrace.push(service);
        }

        let next = () => {
          registry[currentName] = MixinsAppService.LOAD_STATUS_COMPLETE;
          step();
        };

        if (hooks && hooks[group] && hooks[group][method]) {
          let argsLocal = args.concat([registry, next]);
          registry[currentName] = hooks[group][method].apply(service, argsLocal);
        }

        // "wait" says to retry after processing other services.
        if (registry[currentName] === MixinsAppService.LOAD_STATUS_WAIT) {
          // Enqueue again.
          mixins.push(service);
          step();
        }
        // "stop" allows to let service to relaunch process itself.
        else if (registry[currentName] !== MixinsAppService.LOAD_STATUS_STOP) {
          next();
        }
      }
      // No more service.
      else {
        clearTimeout(timeout);

        callback && callback(registry);
      }
    };

    step();
  }
}
