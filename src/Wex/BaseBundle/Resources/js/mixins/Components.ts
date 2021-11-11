import MixinInterface from '../interfaces/MixinInterface';
import MixinsAppService from '../class/MixinsAppService';
import AppService from '../class/AppService';
import Page from '../class/Page';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import {MixinPrompts} from './Prompts';

export class ComponentsService extends AppService {
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
}

export const MixinComponents: MixinInterface = {
  name: 'components',

  dependencies: [
    MixinPrompts,
  ],

  hooks: {
    page: {
      loadPageRenderData(page: Page, registry: any) {
        // Wait for page loading.
        if (registry.pages !== MixinsAppService.LOAD_STATUS_COMPLETE
          || registry.assets !== MixinsAppService.LOAD_STATUS_COMPLETE) {
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
