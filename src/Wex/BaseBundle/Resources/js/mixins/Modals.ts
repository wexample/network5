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
    options: RequestOptionsModalInterface = {},
    callback?: Function
  ): Promise<any> {
    options.layout = options.layout || 'modal';

    return this.services.pages.get(path, options).then((response: Response) => {
      // TODO
      console.log('open modal');

      return response;
    });
  }
}

export const MixinModals: MixinInterface = {
  name: 'modals',

  dependencies: [MixinPages],

  service: ModalsService,
};
