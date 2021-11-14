import MixinInterface from '../interfaces/MixinInterface';
import MixinsAppService from '../class/MixinsAppService';
import AppService from '../class/AppService';
import Page from '../class/Page';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import {MixinPrompts} from './Prompts';
import App from "../class/App";
import RenderDataLayoutInterface from "../interfaces/RenderDataLayoutInterface";

export class ComponentsService extends AppService {
  elTemplates: HTMLElement

  constructor(app: App) {
    super(app);

    this.elTemplates = document.getElementById('component-templates');
  }

  create(elContext: HTMLElement, renderData: RenderDataComponentInterface) {
    let classDefinition = this.app.getBundleClassDefinition(
      'component',
      renderData.name
    );

    // Prevent multiple alerts for the same component.
    if (!classDefinition) {
      this.services.prompts.systemError(
        'page_message.error.com_missing',
        {},
        {
          ':type': renderData.name,
        }
      );
    } else {
      let component = new classDefinition(elContext, renderData);
      component.init(renderData);
    }
  }

  loadRenderData(data: RenderDataLayoutInterface) {
    if (data.templates) {
      // Append html for global components.
      this.elTemplates
        .insertAdjacentHTML('beforeend', data.templates);
    }

    if (data.components) {
      this.createComponents(
        data.components,
        this.app.elLayout
      );
    }
  }

  createComponents(components: RenderDataComponentInterface[], elContext: HTMLElement) {
    components.forEach((data: RenderDataComponentInterface) => {
      this.create(elContext, data)
    });
  }
}

export const MixinComponents: MixinInterface = {
  name: 'components',

  dependencies: [MixinPrompts],

  hooks: {
    app: {
      loadRenderData(
        data: RenderDataLayoutInterface,
        registry: any,
        next: Function
      ) {
        this.services.components.loadRenderData(data);
      },
    },

    page: {
      loadPageRenderData(page: Page, registry: any) {
        // Wait for page loading.
        if (
          registry.pages !== MixinsAppService.LOAD_STATUS_COMPLETE ||
          registry.assets !== MixinsAppService.LOAD_STATUS_COMPLETE
        ) {
          return MixinsAppService.LOAD_STATUS_WAIT;
        }

        page.renderData.components.forEach(
          (componentData: RenderDataComponentInterface) => {
            this.services.components.create(page.el, componentData);
          }
        );

        return MixinsAppService.LOAD_STATUS_COMPLETE;
      },
    },
  },

  service: ComponentsService,
};
