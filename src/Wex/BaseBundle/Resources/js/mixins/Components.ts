import MixinInterface from '../interfaces/MixinInterface';
import MixinsAppService from '../class/MixinsAppService';
import AppService from '../class/AppService';
import Page from '../class/Page';
import ComponentRenderDataInterface from '../interfaces/ComponentRenderDataInterface';
import MixinPrompts from './Prompts';

const mixin: MixinInterface = {
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

        let componentsService = this.app.getService('components');
        page.renderData.components.forEach(
          (componentData: ComponentRenderDataInterface) => {
            componentsService.create(page.el, componentData);
          }
        );

        return MixinsAppService.LOAD_STATUS_COMPLETE;
      },
    },
  },

  service: class extends AppService {
    create(elContext: HTMLElement, renderData: ComponentRenderDataInterface) {
      let classDefinition = this.app.getBundleClassDefinition(
        'component',
        renderData.name
      );

      // Prevent multiple alerts for the same component.
      if (!classDefinition) {
        let promptService = this.app.getService('prompts');

        promptService.systemError(
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
  },
};

export default mixin;
