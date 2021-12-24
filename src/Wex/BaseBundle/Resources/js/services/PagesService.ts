import AdaptiveService from './AdaptiveService';
import LocaleService from './LocaleService';
import MixinsAppService from '../class/MixinsAppService';
import RenderDataPageInterface from '../interfaces/RenderData/PageInterface';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';
import RequestOptionsPageInterface from '../interfaces/RequestOptions/PageInterface';
import { PageInterface as ServiceRegistryPageInterface } from '../interfaces/ServiceRegistry/PageInterface';
import RenderNodeService from './RenderNodeService';
import Page from '../class/Page';
import RenderNode from '../class/RenderNode';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';
import AppService from '../class/AppService';

export default class PagesService extends RenderNodeService {
  public pages: {};
  public services: ServiceRegistryPageInterface;
  public static dependencies: typeof AppService[] = [
    AdaptiveService,
    LocaleService,
  ];

  registerHooks() {
    return {
      app: {
        async loadLayoutRenderData(
          renderData: LayoutInterface,
          requestOptions: RequestOptionsInterface,
          registry: any
        ) {
          if (
            registry.components === MixinsAppService.LOAD_STATUS_COMPLETE &&
            registry.responsive === MixinsAppService.LOAD_STATUS_COMPLETE &&
            registry.locale === MixinsAppService.LOAD_STATUS_COMPLETE
          ) {
            if (renderData.page) {
              await this.services.pages.createPage(
                renderData.page,
                requestOptions
              );
            }
            return;
          }

          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    };
  }

  async createPage(
    renderData: RenderDataPageInterface,
    requestOptions: RequestOptionsInterface
  ) {
    let el;

    if (renderData.isInitialPage) {
      el = this.app.layout.el;
      requestOptions.callerRenderNode = this.app.layout;
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

      requestOptions.callerRenderNode = pageHandler;
    }

    if (!el) {
      let promptService = this.services.prompt;

      promptService.systemError('page_message.error.page_missing_el');
      return;
    }

    await this.createRenderNode(
      renderData.name,
      el,
      renderData,
      requestOptions
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
