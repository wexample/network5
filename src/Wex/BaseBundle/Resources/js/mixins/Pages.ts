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

export class PagesService extends RenderNodeService {
  pages: {};
  services: ServiceRegistryPageInterface;

  createPage(renderData: RenderDataPageInterface, complete?: Function) {
    let el;
    let parentRenderNode;

    if (renderData.isLayoutPage) {
      el = this.app.elLayout;
      parentRenderNode = this.app.layout;
    } else {
      el = renderData.el;
    }

    let pageHandler =
      this.services.components.pageHandlerRegistry[renderData.renderRequestId];
    if (pageHandler) {
      parentRenderNode = pageHandler;
      delete this.services.components.pageHandlerRegistry[
        renderData.renderRequestId
        ];

      if (parentRenderNode) {
        parentRenderNode.renderPageEl(renderData);
        el = parentRenderNode.getPageEl();
      }
    }

    if (!el) {
      let promptService = this.services.prompts;

      promptService.systemError('page_message.error.page_missing_el');
      return;
    }

    this.createRenderNode(el, parentRenderNode, renderData, complete);
  }

  createRenderNodeInstance(
    el: HTMLElement,
    parentRenderNode: RenderNode,
    renderData: RenderDataPageInterface,
    classDefinition: any
  ): RenderNode | null {
    return super.createRenderNodeInstance(
      el,
      parentRenderNode,
      renderData,
      classDefinition || this.app.getClassPage(),
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
        registry: any,
        next: Function
      ) {
        if (
          registry.components === MixinsAppService.LOAD_STATUS_COMPLETE &&
          registry.responsive === MixinsAppService.LOAD_STATUS_COMPLETE &&
          registry.locale === MixinsAppService.LOAD_STATUS_COMPLETE
        ) {
          if (renderData.page) {
            this.services.pages.createPage(renderData.page, next);

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
