import AdaptiveInterface from '../interfaces/RequestOptions/AdaptiveInterface';
import AppService from '../class/AppService';
import MixinsAppService from '../class/MixinsAppService';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';
import ComponentsService from './ComponentsService';

export default class AdaptiveService extends AppService {
  public static dependencies: typeof AppService[] = [ComponentsService];

  registerHooks() {
    return {
      app: {
        loadRenderData(
          renderData: RenderDataInterface,
          requestOptions: RequestOptionsInterface,
          registry
        ) {
          // Expect all assets to be loaded before triggering events.
          if (registry.components === MixinsAppService.LOAD_STATUS_COMPLETE) {
            // TODO Events...
            return;
          }
          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    };
  }

  get(path, requestOptions: AdaptiveInterface): Promise<any> {
    return fetch(path, {
        ...{
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        },
        ...requestOptions,
      })
      .then((response: Response) => {
        if (response.ok) {
          return response.json();
        }
        // TODO ERRORS HANDLING
      })
      .then((response: RenderDataInterface) => {
        // Wait render data loading to continue.
        return this.app.loadRenderData(response, requestOptions).then(() => {
          return response;
        });
      });
  }
}
