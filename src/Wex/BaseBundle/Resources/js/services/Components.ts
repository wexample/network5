import MixinsAppService from '../class/MixinsAppService';
import Page from '../class/Page';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import PromptService from './Prompts';
import App from '../class/App';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';
import PageHandlerComponent from '../class/PageHandlerComponent';
import Component from '../class/Component';
import RenderNodeService from './RenderNodeService';
import RenderNode from '../class/RenderNode';
import { findPreviousNode as DomFindPreviousNode } from '../helpers/Dom';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';
import AppService from '../class/AppService';

export default class ComponentsService extends RenderNodeService {
  elLayoutComponents: HTMLElement;
  pageHandlerRegistry: { [key: string]: PageHandlerComponent } = {};

  public static dependencies: typeof AppService[] = [
    PromptService
  ];

  constructor(app: App) {
    super(app);

    this.elLayoutComponents = document.getElementById('layout-components');
  }

  registerHooks() {
    return {
      app: {
        loadRenderData(
          renderData: RenderDataLayoutInterface,
          requestOptions: RequestOptionsInterface,
          registry: any,
          next: Function
        ) {
          if (registry.assets !== MixinsAppService.LOAD_STATUS_COMPLETE) {
            return MixinsAppService.LOAD_STATUS_WAIT;
          }

          this.services.components.loadLayoutRenderData(
            renderData,
            requestOptions,
            next
          );

          return MixinsAppService.LOAD_STATUS_STOP;
        },
      },

      page: {
        loadPageRenderData(page: Page, registry: any, next: Function) {
          // Wait for page loading.
          if (
            registry.pages !== MixinsAppService.LOAD_STATUS_COMPLETE ||
            registry.assets !== MixinsAppService.LOAD_STATUS_COMPLETE
          ) {
            return MixinsAppService.LOAD_STATUS_WAIT;
          }

          this.services.components.loadPageRenderData(page, next);

          return MixinsAppService.LOAD_STATUS_STOP;
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
        {
          ':type': renderData.name,
          ':renderData': renderData,
        }
      );
    } else {
      return super.createRenderNodeInstance(
        el,
        renderData,
        classDefinition
      ) as Component;
    }
  }

  loadLayoutRenderData(
    renderData: RenderDataLayoutInterface,
    requestOptions: RequestOptionsInterface,
    complete?: Function
  ) {
    if (renderData.templates) {
      // Append html for global components.
      this.elLayoutComponents.innerHTML += renderData.templates;
    }

    if (renderData.components) {
      this.createComponents(
        renderData.components,
        requestOptions,
        this.app.layout.el,
        complete
      );
    }
  }

  loadPageRenderData(page: Page, complete?: Function) {
    let requestOptions: RequestOptionsInterface = {
      ...page.requestOptions,
      ...{
        parentRenderNode: page,
      },
    };

    this.createComponents(
      page.renderData.components,
      requestOptions,
      page.el,
      complete
    );
  }

  createComponents(
    components: RenderDataComponentInterface[],
    requestOptions: RequestOptionsInterface,
    elContext: HTMLElement,
    complete?: Function
  ) {
    if (!components.length) {
      complete && complete();
      return;
    }

    let counter: number = 0;

    components.forEach((renderData: RenderDataComponentInterface) => {
      counter++;

      let el: HTMLElement;
      let elPlaceholder = elContext.querySelector(
        '.' + renderData.id
      ) as HTMLElement;
      let removePlaceHolder = true;

      switch (renderData.initMode) {
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

      this.createRenderNode(el, renderData, requestOptions, () => {
        if (--counter === 0) {
          complete && complete();
        }
      });
    });
  }
}
