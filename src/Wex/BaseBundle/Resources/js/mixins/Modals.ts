import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import RequestOptionsModalInterface from '../interfaces/RequestOptionsModalInterface';
import { MixinPages, PagesService } from './Pages';

export class ModalsService extends AppService {
  services: {
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

export const MixinModals: MixinInterface = {
  name: 'modals',

  dependencies: [MixinPages],

  service: ModalsService,
};
