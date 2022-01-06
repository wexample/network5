import AdaptiveService from './AdaptiveService';
import LocaleService from './LocaleService';
import MixinsAppService from '../class/MixinsAppService';
import RenderDataPageInterface from '../interfaces/RenderData/PageInterface';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';
import RequestOptionsPageInterface from '../interfaces/RequestOptions/PageInterface';
import RenderNodeService from './RenderNodeService';
import Page from '../class/Page';
import RenderNode from '../class/RenderNode';
import AppService from '../class/AppService';

export default class PagesService extends RenderNodeService {
  public pages: {};

  public static dependencies: typeof AppService[] = [
    AdaptiveService,
    LocaleService,
  ];

  registerHooks() {
    return {
      app: {
        async hookLoadLayoutRenderData(renderData: LayoutInterface, registry: any) {
          if (
            registry.components === MixinsAppService.LOAD_STATUS_COMPLETE &&
            registry.responsive === MixinsAppService.LOAD_STATUS_COMPLETE &&
            registry.locale === MixinsAppService.LOAD_STATUS_COMPLETE
          ) {
            if (renderData.page) {
              await this.services.pages.createPage(renderData.page);
            }
            return;
          }

          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    };
  }

  async createPage(renderData: RenderDataPageInterface) {
    let parentNode: RenderNode;

    if (renderData.isInitialPage) {
      parentNode = this.app.layout;
    }

    let pageHandler =
      this.services.components.pageHandlerRegistry[renderData.renderRequestId];

    if (pageHandler) {
      parentNode = pageHandler;

      delete this.services.components.pageHandlerRegistry[
        renderData.renderRequestId
      ];
    }

    await this.createRenderNode(renderData.name, renderData, parentNode);
  }

  createRenderNodeInstance(
    classDefinition: any,
    parentRenderNode: RenderNode
  ): RenderNode | null {
    return super.createRenderNodeInstance(
      classDefinition || this.app.getClassPage(),
      parentRenderNode
    ) as Page;
  }

  get(path: string, options: RequestOptionsPageInterface): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}
