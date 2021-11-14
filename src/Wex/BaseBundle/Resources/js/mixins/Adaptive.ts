import RequestOptionsAdaptiveInterface from '../interfaces/RequestOptionsAdaptiveInterface';
import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import MixinsAppService from "../class/MixinsAppService";

export class AdaptiveService extends AppService {
  get(path, options: RequestOptionsAdaptiveInterface): Promise<any> {
    return window
      .fetch(path, {
        ...{
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        },
        ...options,
      })
      .then((response: Response) => {
        if (response.ok) {
          return response.json();
        }

        this.app.loadRenderData(response)
      });
  }
}

export const MixinAdaptive: MixinInterface = {
  name: 'adaptive',

  hooks: {
    app: {
      loadRenderData(data, registry) {
        // Expect all assets to be loaded before triggering events.
        if (registry.components === MixinsAppService.LOAD_STATUS_COMPLETE) {
          for (let event of data.events) {
            this.adaptive.triggerEvent(event, data);
          }

          return MixinsAppService.LOAD_STATUS_COMPLETE;
        }
        return MixinsAppService.LOAD_STATUS_WAIT;
      },
    },
  },

  service: AdaptiveService,
};
