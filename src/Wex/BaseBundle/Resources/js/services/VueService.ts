import { createApp } from 'vue/dist/vue.esm-bundler';
import AppService from '../class/AppService';
import PagesService from './PagesService';
import MixinsAppService from '../class/MixinsAppService';
import ComponentInterface from '../interfaces/RenderData/ComponentInterface';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';
import { appendInnerHtml } from "../helpers/Dom";
import Component from "../class/Component";

export default class VueService extends AppService {
  protected componentRegistered: any = {};

  public static dependencies: typeof AppService[] = [PagesService];

  protected globalMixin: any;

  protected renderedTemplates: { [key: string]: boolean } = {};

  registerHooks(): { app?: {}; page?: {} } {
    return {
      app: {
        init(registry) {
          // Wait for vue to be loaded.
          if (
            registry.assets === MixinsAppService.LOAD_STATUS_COMPLETE &&
            registry.pages === MixinsAppService.LOAD_STATUS_COMPLETE
          ) {
            let app = this.app;
            this.globalMixin = {
              props: {
                rootComponent: {
                  default: () => {
                    return this;
                  },
                },
                app: {
                  default: () => {
                    return app;
                  },
                },
              },
            };

            this.app.mix(this.globalMixin, 'vue');

            return;
          }
          return MixinsAppService.LOAD_STATUS_WAIT;
        },

        loadLayoutRenderData(renderData: LayoutInterface) {
          this.services.vue.addTemplatesHtml(renderData.vueTemplates);
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

  inherit(vueComponent) {
    let componentsFinal = vueComponent.components || {};
    let extend = {components: {}};

    if (vueComponent.extends) {
      extend = this.inherit(vueComponent.extends);
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
          vueComponent.components[data[0]] = this.initComponent(data[1]);
        } else {
          vueComponent.components[data[0]] = this.componentRegistered[data[1]];
        }
      }
    });

    return vueComponent;
  }

  createVueAppForComponent(component: Component, renderData: ComponentInterface) {
    let vue = this.initComponent(renderData.options.path);

    let app = this.createApp(vue, {
      ...component.options.props,
      ...{
        renderData: renderData,
        rootComponent: component,
      }
    });

    Object.entries(this.componentRegistered).forEach((data) => {
      app.component(data[0], data[1]);
    });

    return app;
  }

  initComponent(className) {
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

        vueClassDefinition.mixins = (vueClassDefinition.mixins || []).concat([
          this.globalMixin,
        ]);

        if (!vueClassDefinition.template) {
          throw new Error(
            `Unable to load vue component as template item #${id} has not been found.`
          );
        }

        this.componentRegistered[className] = vueClassDefinition;

        this.inherit(vueClassDefinition);
      }

      return this.componentRegistered[className];
    }
  }

  addTemplatesHtml(renderedTemplates: string[]) {
    let elContainer = document.getElementById('vue-templates');

    for (let name in renderedTemplates) {
      if (!this.renderedTemplates[name]) {
        appendInnerHtml(elContainer, renderedTemplates[name]);
        this.renderedTemplates[name] = true;
      }
    }
  }
}
