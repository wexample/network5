import {MixinLocale} from './Locale';
import MixinInterface from '../interfaces/MixinInterface';
import Page from '../class/Page';
import AppService from '../class/AppService';
import MixinsAppService from '../class/MixinsAppService';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';
import RequestOptionsPageInterface from "../interfaces/RequestOptionsPageInterface";
import {AdaptiveService, MixinAdaptive} from "./Adaptive";
import {PromptService} from "./Prompts";
import {EventsService} from "./Events";
import {ServiceRegistryPageInterface} from "../interfaces/ServiceRegistryPageInterface";

export class PagesService extends AppService {
  pages: {};
  services: ServiceRegistryPageInterface

  create(data: RenderDataPageInterface, complete: Function): Page {
    let classDefinition = this.app.getBundleClassDefinition(
      'page',
      data.name
    );

    if (!classDefinition) {
      classDefinition = this.app.getClassPage();
    }

    let page = new classDefinition(this.app, data);
    page.loadInitialRenderData(data, complete);

    return page;
  }

  get(
    path: string,
    options: RequestOptionsPageInterface
  ): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}

export const MixinPages: MixinInterface = {
  name: 'pages',

  dependencies: [
    MixinLocale,
    MixinAdaptive,
  ],

  hooks: {
    app: {
      loadLayoutRenderData(
        data: RenderDataLayoutInterface,
        registry: any,
        next: Function
      ) {
        if (
          registry.responsive === MixinsAppService.LOAD_STATUS_COMPLETE &&
          registry.locale === MixinsAppService.LOAD_STATUS_COMPLETE
        ) {
          if (data.page) {
            this.services.pages.create(data.page, next);
          }

          return MixinsAppService.LOAD_STATUS_STOP;
        }
        return MixinsAppService.LOAD_STATUS_WAIT;
      },
    },
  },

  service: PagesService
};
