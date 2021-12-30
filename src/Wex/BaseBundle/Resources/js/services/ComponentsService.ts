import MixinsAppService from '../class/MixinsAppService';
import Page from '../class/Page';
import PromptService from './PromptsService';
import App from '../class/App';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';
import PageManagerComponent from '../class/PageManagerComponent';
import Component from '../class/Component';
import RenderNodeService from './RenderNodeService';
import RenderNode from '../class/RenderNode';
import { appendInnerHtml } from '../helpers/Dom';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import AppService from '../class/AppService';

export default class ComponentsService extends RenderNodeService {
  elLayoutComponents: HTMLElement;
  pageHandlerRegistry: { [key: string]: PageManagerComponent } = {};

  public static dependencies: typeof AppService[] = [PromptService];

  constructor(app: App) {
    super(app);

    this.elLayoutComponents = document.getElementById('components-templates');
  }

  registerHooks() {
    return {
      app: {
        async loadLayoutRenderData(renderData: LayoutInterface, registry: any) {
          if (registry.assets !== MixinsAppService.LOAD_STATUS_COMPLETE) {
            return MixinsAppService.LOAD_STATUS_WAIT;
          }

          await this.services.components.loadLayoutRenderData(renderData);
        },
      },

      component: {
        async initComponent(component: Component) {
          await this.createRenderDataComponents(
            component.renderData,
            component
          );
        },
      },

      page: {
        async initPage(page: Page) {
          await this.createRenderDataComponents(page.renderData, page);
        },
      },
    };
  }

  createRenderNodeInstance(
    classDefinition: any,
    parentRenderNode: RenderNode
  ): RenderNode | null {
    // Prevent multiple alerts for the same component.
    if (!classDefinition) {
      this.services.prompt.systemError(
        'page_message.error.com_missing',
        {},
        classDefinition
      );
    } else {
      return super.createRenderNodeInstance(
        classDefinition,
        parentRenderNode
      ) as Component;
    }
  }

  async loadLayoutRenderData(renderData: LayoutInterface) {
    if (renderData.templates) {
      // Append html for global components.
      appendInnerHtml(this.elLayoutComponents, renderData.templates);
    }

    await this.createRenderDataComponents(renderData, this.app.layout);
  }

  async createRenderDataComponents(
    renderData: RenderDataInterface,
    parentRenderNode: RenderNode
  ) {
    for (const renderDataComponent of renderData.components) {
      // Share request options.
      renderDataComponent.requestOptions = renderData.requestOptions;

      let component = (await this.createRenderNode(
        renderDataComponent.name,
        renderDataComponent,
        parentRenderNode
      )) as Component;

      parentRenderNode.components.push(component);
    }
  }
}
