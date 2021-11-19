import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import MixinsAppService from '../class/MixinsAppService';
import { shallowCopy as arrayShallowCopy } from '../helpers/Arrays';

export class MixinService extends AppService {
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
    mixins: MixinInterface[] = null
  ) {
    let registry: { [key: string]: string } = {};
    mixins = mixins || arrayShallowCopy(
      this.app.mixins
    ) as MixinInterface[];
    let loops: number = 0;
    let loopsLimit: number = 100;
    let errorTrace: MixinInterface[] = [];
    let currentName: string = 'startup';

    let timeout = setTimeout(() => {
      throw `Mixins invocation timeout on method "${method}", stopping at "${currentName}".`;
    }, timeoutLimit);

    let step = () => {
      let mixin: MixinInterface = mixins.shift() as MixinInterface;

      if (mixin) {
        currentName = mixin.name;

        if (loops++ > loopsLimit) {
          console.error(errorTrace);
          throw (
            `Stopping more than ${loops} recursions during services invocation ` +
            `on method "${method}", stopping at ${currentName}, see trace below.`
          );
        } else if (loops > loopsLimit - 10) {
          errorTrace.push(mixin);
        }

        let next = () => {
          registry[currentName] = MixinsAppService.LOAD_STATUS_COMPLETE;
          step();
        };

        if (mixin.hooks && mixin.hooks[group] && mixin.hooks[group][method]) {
          let argsLocal = args.concat([registry, next]);
          registry[currentName] = mixin.hooks[group][method].apply(
            this,
            argsLocal
          );
        }

        // "wait" says to retry after processing other services.
        if (registry[currentName] === MixinsAppService.LOAD_STATUS_WAIT) {
          // Enqueue again.
          mixins.push(mixin);
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

export const MixinMixins: MixinInterface = {
  name: 'mixins',

  service: MixinService,
};
