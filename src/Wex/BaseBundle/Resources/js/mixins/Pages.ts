import MixinLocale from './Locale';
import MixinInterface from '../interfaces/MixinInterface';
import Page from '../class/Page';
import AppService from '../class/AppService';
import MixinsAppService from '../class/MixinsAppService';
import PageRenderDataInterface from '../interfaces/PageRenderDataInterface';
import LayoutRenderDataInterface from '../interfaces/LayoutRenderDataInterface';

const mixin: MixinInterface = {
  name: 'pages',

  dependencies: {
    MixinLocale,
  },

  hooks: {
    app: {
      loadLayoutRenderData(
        data: LayoutRenderDataInterface,
        registry: any,
        next: Function
      ) {
        if (
          registry.MixinResponsive === MixinsAppService.LOAD_STATUS_COMPLETE &&
          registry.MixinLocale === MixinsAppService.LOAD_STATUS_COMPLETE
        ) {
          if (data.page) {
            this.app.getService('pages').create(data.page, next);
          }

          return MixinsAppService.LOAD_STATUS_STOP;
        }
        return MixinsAppService.LOAD_STATUS_WAIT;
      },
    },
  },

  service: class extends AppService {
    pages: {};

    create(data: PageRenderDataInterface, complete: Function): Page {
      let classDefinition = this.app.getBundleClassDefinition(
        'page',
        data.name
      );

      if (!classDefinition) {
        classDefinition = this.app.getClassPage();
      }

      let page = new classDefinition(this.app, data);
      page.loadInitialRenderData(data, complete);

      return page;
    }
  },
};

export default mixin;
