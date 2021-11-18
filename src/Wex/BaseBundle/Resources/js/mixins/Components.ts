import MixinInterface from '../interfaces/MixinInterface';
import MixinsAppService from '../class/MixinsAppService';
import AppService from '../class/AppService';
import Page from '../class/Page';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import { MixinPrompts } from './Prompts';
import App from '../class/App';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';
import PageHandlerComponent from '../class/PageHandlerComponent';
import Component from '../class/Component';

export class ComponentsService extends AppService {
  elLayoutComponents: HTMLElement;
  pageHandlerRegistry: { [key: string]: PageHandlerComponent } = {};

  constructor(app: App) {
    super(app);

    this.elLayoutComponents = document.getElementById('layout-components');
  }

  create(
    elContext: HTMLElement,
    renderData: RenderDataComponentInterface,
    complete?: Function
  ) {
    this.services.assets.updateAssetsCollection(renderData.assets, () => {
      let classDefinition = this.app.getBundleClassDefinition(renderData.name);

      // Prevent multiple alerts for the same component.
      if (!classDefinition) {
        this.services.prompts.systemError(
          'page_message.error.com_missing',
          {},
          {
            ':type': renderData.name,
            ':renderData': renderData,
          }
        );
      } else {
        let component = new classDefinition(
          this.app,
          elContext,
          renderData
        ) as Component;
        component.init(renderData);

        complete && complete();
      }
    });
  }

  loadLayoutRenderData(data: RenderDataLayoutInterface, complete?: Function) {
    if (data.templates) {
      // Append html for global components.
      this.elLayoutComponents.insertAdjacentHTML('beforeend', data.templates);
    }

    if (data.components) {
      this.createComponents(data.components, this.app.elLayout, complete);
    }
  }

  loadPageRenderData(page: Page, complete?: Function) {
    this.createComponents(page.renderData.components, page.el, complete);
  }

  createComponents(
    components: RenderDataComponentInterface[],
    elContext: HTMLElement,
    complete?: Function
  ) {
    if (!components.length) {
      complete && complete();
      return;
    }

    let counter: number = 0;

    components.forEach((data: RenderDataComponentInterface) => {
      counter++;
      this.create(elContext, data, () => {
        if (--counter === 0) {
          complete && complete();
        }
      });
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
        if (registry.assets !== MixinsAppService.LOAD_STATUS_COMPLETE) {
          return MixinsAppService.LOAD_STATUS_WAIT;
        }

        this.services.components.loadLayoutRenderData(data, next);

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
  },

  service: ComponentsService,
};
