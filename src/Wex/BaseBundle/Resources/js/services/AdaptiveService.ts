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

  fetch(
    path: string,
    requestOptions: RequestOptionsInterface = {}
  ): Promise<any> {
    return fetch(path, {
      ...{
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
      ...requestOptions,
    });
  }

  get(
    path: string,
    requestOptions: RequestOptionsInterface = {}
  ): Promise<any> {
    return this.fetch(path, requestOptions)
      .then((response: Response) => {
        if (response.ok) {
          return response.json();
        }
        // TODO ERRORS HANDLING
      })
      .then(async (renderData: RenderDataInterface) => {
        renderData.requestOptions = requestOptions;

        await this.services.layouts.prepareRenderData(renderData);

        // Wait render data loading to continue.
        return this.app.loadLayoutRenderData(renderData, requestOptions).then(() => {
          return renderData;
        });
      });
  }
}
