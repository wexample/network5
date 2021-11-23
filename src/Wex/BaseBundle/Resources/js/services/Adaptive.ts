import RequestOptionsAdaptiveInterface from '../interfaces/RequestOptionsAdaptiveInterface';
import AppService from '../class/AppService';
import MixinsAppService from '../class/MixinsAppService';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';
import ComponentsService from "./Components";

export default class AdaptiveService extends AppService {
  public static dependencies: typeof AppService[] = [ComponentsService]

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
            return MixinsAppService.LOAD_STATUS_COMPLETE;
          }
          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    }
  }

  get(path, requestOptions: RequestOptionsAdaptiveInterface): Promise<any> {
    return window
      .fetch(path, {
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
        return new Promise((resolve, reject) => {
          this.app.loadRenderData(response, requestOptions, () =>
            resolve(response)
          );
        });
      });
  }
}
