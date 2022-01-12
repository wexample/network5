import { createApp } from 'vue/dist/vue.esm-bundler';
import AppService from '../class/AppService';
import PagesService from './PagesService';
import MixinsAppService from '../class/MixinsAppService';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';
import { appendInnerHtml } from '../helpers/Dom';
import Component from '../class/Component';

export default class VueService extends AppService {
  protected componentRegistered: { [key: string]: object } = {};
  public static dependencies: typeof AppService[] = [PagesService];
  protected elTemplates: HTMLElement;
  public vueRenderDataCache: { [key: string]: ComponentInterface } = {}

  protected globalMixin: object = {
    props: {},

    methods: {},

    async updated() {
      await this.rootComponent.forEachTreeRenderNode((renderNode) => {
        if (this === this.$root) {
          renderNode.updateMounting();
        }
      });
    },
  };

  public renderedTemplates: { [key: string]: boolean } = {};

  constructor(app: App) {
    super(app);

    this.elTemplates = document.getElementById('vue-templates');
  }

  registerHooks(): { app?: {}; page?: {} } {
    return {
      app: {
        hookInit(registry) {
          // Wait for vue to be loaded.
          if (
            registry.assets === MixinsAppService.LOAD_STATUS_COMPLETE &&
            registry.pages === MixinsAppService.LOAD_STATUS_COMPLETE
          ) {
            this.app.mix(this.globalMixin, 'vue');

            return;
          }
          return MixinsAppService.LOAD_STATUS_WAIT;
        },

        hookLoadLayoutRenderData(renderData: LayoutInterface) {
          this.services.vue.addTemplatesHtml(renderData.vueTemplates);
        },
      },
    };
  }

  registerMethods() {
    let app = this.app;

    return {
      vue: {
        props: {
          app: {
            default: () => {
              return app;
            },
          },
        },
      },
    };
  }

  createApp(config, options: any = {}) {
    return createApp(config, options);
  }

  createComName(path) {
    return path.split('/').join('-').toLowerCase();
  }

  inherit(vueComponent, rootComponent: Component) {
    let componentsFinal = vueComponent.components || {};
    let extend = { components: {} };

    if (vueComponent.extends) {
      extend = this.inherit(vueComponent.extends, rootComponent);
    }

    let componentsStrings = {
      ...extend.components,
      ...componentsFinal,
    };

    // Convert initial strings to initialized component.
    Object.entries(componentsStrings).forEach((data) => {
      // Prevent to initialize already converted object.
      if (typeof data[1] === 'string') {
        if (!this.componentRegistered[data[1]]) {
          vueComponent.components[data[0]] = this.initComponent(
            data[1],
            rootComponent
          );
        } else {
          vueComponent.components[data[0]] = this.componentRegistered[data[1]];
        }
      }
    });

    return vueComponent;
  }

  createVueAppForComponent(component: Component) {
    let vue = this.initComponent(component.renderData.options.path, component);

    let app = this.createApp(vue, component.options.props);

    Object.entries(this.componentRegistered).forEach((data) => {
      app.component(data[0], data[1]);
    });

    return app;
  }

  initComponent(className, rootComponent: Component): object {
    if (!this.componentRegistered[className]) {
      let vueClassDefinition = this.app.getBundleClassDefinition(className);

      if (!vueClassDefinition) {
        this.services.prompt.systemError(
          'page_message.error.vue_missing',
          {},
          {
            ':class': className,
          }
        );
      } else {
        let comName = this.createComName(className);
        let id = `vue-template-${comName}`;

        vueClassDefinition.template = document.getElementById(id);

        vueClassDefinition.props = {
          ...vueClassDefinition.props,
          ...{
            rootComponent: {
              type: Object,
              default: rootComponent,
            },
            translations: {
              type: Object,
              default: rootComponent.translations[`INCLUDE|${comName}`],
            },
          },
        };

        vueClassDefinition.mixins = (vueClassDefinition.mixins || []).concat([
          this.globalMixin,
        ]);

        if (!vueClassDefinition.template) {
          throw new Error(
            `Unable to load vue component as template item #${id} has not been found.`
          );
        }

        this.componentRegistered[className] = vueClassDefinition;

        this.inherit(vueClassDefinition, rootComponent);
      }

      return this.componentRegistered[className];
    }
  }

  addTemplatesHtml(renderedTemplates: string[]) {
    let elContainer = this.elTemplates;

    for (let name in renderedTemplates) {
      if (!this.renderedTemplates[name]) {
        appendInnerHtml(elContainer, renderedTemplates[name]);
        this.renderedTemplates[name] = true;
      }
    }
  }
}
