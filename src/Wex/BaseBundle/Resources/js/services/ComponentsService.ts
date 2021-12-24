import MixinsAppService from '../class/MixinsAppService';
import Page from '../class/Page';
import PromptService from './PromptsService';
import App from '../class/App';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';
import PageHandlerComponent from '../class/PageHandlerComponent';
import Component from '../class/Component';
import RenderNodeService from './RenderNodeService';
import RenderNode from '../class/RenderNode';
import { findPreviousNode as DomFindPreviousNode } from '../helpers/Dom';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';
import AppService from '../class/AppService';

export class ComponentsServiceEvents {
  public static CREATE_COMPONENT: string = 'create-component';
}

export default class ComponentsService extends RenderNodeService {
  elLayoutComponents: HTMLElement;
  pageHandlerRegistry: { [key: string]: PageHandlerComponent } = {};

  public static dependencies: typeof AppService[] = [PromptService];

  constructor(app: App) {
    super(app);

    this.elLayoutComponents = document.getElementById('components-templates');
  }

  registerHooks() {
    return {
      app: {
        async loadLayoutRenderData(
          renderData: LayoutInterface,
          requestOptions: RequestOptionsInterface,
          registry: any
        ) {
          if (registry.assets !== MixinsAppService.LOAD_STATUS_COMPLETE) {
            return MixinsAppService.LOAD_STATUS_WAIT;
          }

          await this.services.components.loadLayoutRenderData(
            renderData,
            requestOptions
          );
        },
      },

      page: {
        async initPage(page: Page, registry: any) {
          // Wait for page loading.
          if (
            registry.pages !== MixinsAppService.LOAD_STATUS_COMPLETE ||
            registry.assets !== MixinsAppService.LOAD_STATUS_COMPLETE
          ) {
            return MixinsAppService.LOAD_STATUS_WAIT;
          }

          await this.services.components.initPage(page);
        },
      },
    };
  }

  createRenderNodeInstance(
    el: HTMLElement,
    renderData: RenderDataInterface,
    classDefinition: any
  ): RenderNode | null {
    // Prevent multiple alerts for the same component.
    if (!classDefinition) {
      this.services.prompt.systemError(
        'page_message.error.com_missing',
        {},
        renderData
      );
    } else {
      return super.createRenderNodeInstance(
        el,
        renderData,
        classDefinition
      ) as Component;
    }
  }

  async loadLayoutRenderData(
    renderData: LayoutInterface,
    requestOptions: RequestOptionsInterface
  ) {
    if (renderData.templates) {
      // Append html for global components.
      this.elLayoutComponents.innerHTML += renderData.templates;
    }

    await this.createRenderDataComponents(
      renderData,
      this.app.layout,
      requestOptions
    );
  }

  async initPage(page: Page) {
    await this.createRenderDataComponents(
      page.renderData,
      page,
      page.requestOptions
    );
  }

  async createRenderDataComponents(
    renderData: RenderDataInterface,
    renderNode: RenderNode,
    requestOptions: RequestOptionsInterface
  ) {
    for (const renderDataComponent of renderData.components) {
      let el: HTMLElement;
      let elPlaceholder = renderNode.el.querySelector(
        `.${renderDataComponent.id}`
      ) as HTMLElement;
      let removePlaceHolder = true;

      if (!elPlaceholder) {
        this.services.prompt.systemError(
          'page_message.error.com_placeholder_missing',
          {},
          renderDataComponent
        );
      }

      switch (renderDataComponent.initMode) {
        case Component.INIT_MODE_CLASS:
          el = elPlaceholder;
          removePlaceHolder = false;
          break;
        case Component.INIT_MODE_PARENT:
          el = elPlaceholder.parentElement;
          break;
        case Component.INIT_MODE_LAYOUT:
        case Component.INIT_MODE_PREVIOUS:
          el = DomFindPreviousNode(elPlaceholder);
          break;
      }

      if (removePlaceHolder) {
        // Remove placeholder tag as it may interact with CSS or JS selectors.
        elPlaceholder.remove();
      }

      let component = (await this.createRenderNode(
        renderDataComponent.name,
        el,
        renderDataComponent,
        requestOptions
      )) as Component;

      renderNode.components.push(component);

      this.services.events.trigger(ComponentsServiceEvents.CREATE_COMPONENT, {
        component: component,
      });
    }
  }
}
