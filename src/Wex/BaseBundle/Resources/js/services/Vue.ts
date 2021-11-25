import * as Vue from 'vue'
import { createApp } from 'vue/dist/vue.esm-bundler';

import AppService from "../class/AppService";
import PagesService from "./Pages";
import MixinsAppService from "../class/MixinsAppService";

export default class VueService extends AppService {
  protected componentRegistered: any = {};

  public static dependencies: typeof AppService[] = [
    PagesService,
  ]

  protected globalMixin: any;

  registerHooks(): { app?: {}; page?: {} } {
    return {
      app: {
        init(registry) {
          // Wait for vue to be loaded.
          if (
            registry.assets === MixinsAppService.LOAD_STATUS_COMPLETE &&
            registry.pages === MixinsAppService.LOAD_STATUS_COMPLETE
          ) {
            this.app.addLib('vue', Vue);

            let app = this;
            this.globalMixin = {
              props: {
                app: {
                  default: () => {
                    return app;
                  },
                },
              },
            };

            this.app.mix(
              this.globalMixin,
              'vue'
            );

            return MixinsAppService.LOAD_STATUS_COMPLETE;
          }
          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    };
  }

  createApp(config) {
    return createApp(config);
  }

  createComName(path) {
    return path.split('/').join('-').toLowerCase();
  }

  createVueAppForComponent(path) {
    let component = this.initComponent(
      path
    );

    let app = this.createApp(component);

    Object.entries(this.componentRegistered)
      .forEach((data) => {
        app.component(data[0], data[1]);
      });

    return app;
  }

  initComponent(className) {
    if (!this.componentRegistered[className]) {
      let vueClassDefinition = this.app.getBundleClassDefinition(className);

      if (!vueClassDefinition) {
        this.services.prompts.systemError(
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

        if (!vueClassDefinition.template) {
          throw new Error(
            `Unable to load vue component as template item #${id} has not been found.`
          );
        }

        this.componentRegistered[className] = vueClassDefinition;
      }

      return this.componentRegistered[className];
    }
  }
};
