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
   */
  invokeUntilComplete(method, group = 'app', args = [], callback) {
    let registry = {};
    let mixins = arrayShallowCopy(this.app.mixins);
    let loops = 0;
    let loopsLimit = 100;
    let errorTrace = [];

    let step = () => {
      let mixin = mixins.shift() as MixinInterface;
      if (mixin) {
        if (loops++ > loopsLimit) {
          console.error(errorTrace);
          throw (
            `Stopping more than ${loops} recursions during services invocation ` +
            `on method "${method}", stopping at ${mixin.name}, see trace below.`
          );
        } else if (loops > loopsLimit - 10) {
          errorTrace.push(mixin);
        }

        let next = () => {
          registry[mixin.name] = MixinsAppService.LOAD_STATUS_COMPLETE;
          step();
        };

        if (mixin.hooks && mixin.hooks[group] && mixin.hooks[group][method]) {
          let argsLocal = args.concat([registry, next]);
          registry[mixin.name] = mixin.hooks[group][method].apply(
            this,
            argsLocal
          );
        }

        // "wait" says to retry after processing other services.
        if (registry[mixin.name] === MixinsAppService.LOAD_STATUS_WAIT) {
          // Enqueue again.
          mixins.push(mixin);
          step();
        }
        // "stop" allows to let service to relaunch process itself.
        else if (registry[mixin.name] !== MixinsAppService.LOAD_STATUS_STOP) {
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

export const MixinMixins: MixinInterface = {
  name: 'mixins',

  service: MixinService,
};
