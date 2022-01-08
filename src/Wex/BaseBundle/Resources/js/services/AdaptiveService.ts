import AppService from '../class/AppService';
import MixinsAppService from '../class/MixinsAppService';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';
import ComponentsService from './ComponentsService';

export default class AdaptiveService extends AppService {
  public static dependencies: typeof AppService[] = [ComponentsService];

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
    requestOptions.callerPage =
      requestOptions.callerPage || this.app.layout.pageFocused;

    Object.freeze(requestOptions);

    return this.fetch(path, requestOptions)
      .then((response: Response) => {
        if (response.ok) {
          return response.json();
        }
        // TODO ERRORS HANDLING
      })
      .then(async (renderData: RenderDataInterface) => {
        renderData.requestOptions = requestOptions;

        // Preparing render data is executed in render node creation,
        // but at this point layout already exists,
        // so we run it manually.
        await this.services.layouts.prepareRenderData(renderData);

        // Wait render data loading to continue.
        return this.app.loadLayoutRenderData(renderData).then(() => {
          return renderData;
        });
      });
  }
}
