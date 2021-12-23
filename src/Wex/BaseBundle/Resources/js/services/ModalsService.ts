import AppService from '../class/AppService';
import ModalInterface from '../interfaces/RequestOptions/ModalInterface';
import PagesService from './PagesService';

export default class ModalsService extends AppService {
  public static dependencies: typeof AppService[] = [PagesService];
  public services: {
    pages: PagesService;
  };

  get(path: string, requestOptions: ModalInterface = {}): Promise<any> {
    requestOptions.layout = requestOptions.layout || 'modal';
    requestOptions.callerRenderNode = this.app.layout.pageFocused;
    return this.services.pages.get(path, requestOptions);
  }
}
