import { MixinLocale } from './Locale';
import MixinInterface from '../interfaces/MixinInterface';
import MixinsAppService from '../class/MixinsAppService';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';
import RequestOptionsPageInterface from '../interfaces/RequestOptionsPageInterface';
import { MixinAdaptive } from './Adaptive';
import { ServiceRegistryPageInterface } from '../interfaces/ServiceRegistryPageInterface';
import { RenderNodeService } from './RenderNodeService';
import Page from '../class/Page';
import RenderNode from '../class/RenderNode';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export class PagesService extends RenderNodeService {
  public pages: {};
  public services: ServiceRegistryPageInterface;

  createPage(
    renderData: RenderDataPageInterface,
    requestOptions: RequestOptionsInterface,
    complete?: Function
  ) {
    let el;

    if (renderData.isLayoutPage) {
      el = this.app.layout.el;
      requestOptions.parentRenderNode = this.app.layout;
    } else {
      el = renderData.el;
    }

    let pageHandler =
      this.services.components.pageHandlerRegistry[renderData.renderRequestId];

    if (pageHandler) {
      renderData.pageHandler = pageHandler;

      delete this.services.components.pageHandlerRegistry[
        renderData.renderRequestId
      ];

      pageHandler.renderPageEl(renderData);
      el = pageHandler.getPageEl();

      requestOptions.parentRenderNode = pageHandler;
    }

    if (!el) {
      let promptService = this.services.prompts;

      promptService.systemError('page_message.error.page_missing_el');
      return;
    }

    this.createRenderNode(
      el,
      renderData,
      requestOptions,
      complete
    );
  }

  createRenderNodeInstance(
    el: HTMLElement,
    renderData: RenderDataPageInterface,
    classDefinition: any
  ): RenderNode | null {
    return super.createRenderNodeInstance(
      el,
      renderData,
      classDefinition || this.app.getClassPage()
    ) as Page;
  }

  get(path: string, options: RequestOptionsPageInterface): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}

export const MixinPages: MixinInterface = {
  name: 'pages',

  dependencies: [MixinLocale, MixinAdaptive],

  hooks: {
    app: {
      loadRenderData(
        renderData: RenderDataLayoutInterface,
        requestOptions: RequestOptionsInterface,
        registry: any,
        next: Function
      ) {
        if (
          registry.components === MixinsAppService.LOAD_STATUS_COMPLETE &&
          registry.responsive === MixinsAppService.LOAD_STATUS_COMPLETE &&
          registry.locale === MixinsAppService.LOAD_STATUS_COMPLETE
        ) {
          if (renderData.page) {
            this.services.pages.createPage(
              renderData.page,
              requestOptions,
              next
            );

            return MixinsAppService.LOAD_STATUS_STOP;
          } else {
            return MixinsAppService.LOAD_STATUS_COMPLETE;
          }
        }
        return MixinsAppService.LOAD_STATUS_WAIT;
      },
    },
  },

  service: PagesService,
};
