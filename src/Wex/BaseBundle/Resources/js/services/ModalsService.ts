import AppService from '../class/AppService';
import RequestOptionsModalInterface from '../interfaces/RequestOptionsModalInterface';
import PagesService from './PagesService';

export default class ModalsService extends AppService {
  public static dependencies: typeof AppService[] = [PagesService];
  public services: {
    pages: PagesService;
  };

  get(
    path: string,
    requestOptions: RequestOptionsModalInterface = {}
  ): Promise<any> {
    requestOptions.layout = requestOptions.layout || 'modal';
    requestOptions.parentRenderNode = this.app.layout.pageFocused;

    return this.services.pages.get(path, requestOptions);
  }
}
