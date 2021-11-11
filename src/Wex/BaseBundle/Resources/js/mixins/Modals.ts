import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import RequestOptionsModalInterface from "../interfaces/RequestOptionsModalInterface";
import {MixinPages, PagesService} from "./Pages";

export class ModalsService extends AppService {
  services: {
    pages: PagesService
  }

  get(
    path: string,
    options: RequestOptionsModalInterface = {},
    callback?:Function
  ) {
    options.layout = options.layout || 'modal';

    this.services.pages.get(
      path,
      options,
      (response) => {
        // Page may be missing in case of error on unexpected response.

        callback && callback(response);
      });

    // TODO
    console.log('open modal')
  }
}

export const MixinModals: MixinInterface = {
  name: 'modals',

  dependencies: [
    MixinPages,
  ],

  service: ModalsService,
};
