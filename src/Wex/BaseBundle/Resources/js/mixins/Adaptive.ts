import RequestOptionsAdaptiveInterface from '../interfaces/RequestOptionsAdaptiveInterface';
import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';

export class AdaptiveService extends AppService {
  get(path, options: RequestOptionsAdaptiveInterface): Promise<any> {
    return window.fetch(path).then((response: Response) => {
      if (!response.ok) {
        // TODO
      }

      return response;
    });
  }
}

export const MixinAdaptive: MixinInterface = {
  name: 'adaptive',

  hooks: {
    app: {
      loadRenderData(data, registry) {
        // Expect all assets to be loaded before triggering events.
        if (registry.MixinComponents === 'complete') {
          for (let event of data.events) {
            this.adaptive.triggerEvent(event, data);
          }

          return 'complete';
        }
        return 'wait';
      },
    },
  },

  service: AdaptiveService,
};
