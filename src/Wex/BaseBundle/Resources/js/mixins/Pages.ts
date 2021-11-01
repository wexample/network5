import MixinLocale from './Locale';
import MixinInterface from "../interfaces/MixinInterface";
import Page from "../class/Page";
import AppService from "../class/AppService";
import MixinsAppService from "../class/MixinsAppService";

const mixin: MixinInterface = {
    name: 'pages',

    dependencies: {
        MixinLocale,
    },

    hooks: {
        app: {
            loadRenderData(data, registry) {
                if (registry.MixinResponsive === MixinsAppService.LOAD_STATUS_COMPLETE
                    && registry.MixinLocale === MixinsAppService.LOAD_STATUS_COMPLETE) {
                    this.app.getService('pages').create(data.page);

                    return MixinsAppService.LOAD_STATUS_COMPLETE;
                }
                return MixinsAppService.LOAD_STATUS_WAIT;
            },
        },
    },

    service: class extends AppService {
        pages: {}

        create(data: any): Page {
            let classDefinition = this.app.getClassDefinition(
                'page',
                data.name
            );

            if (!classDefinition) {
                classDefinition = Page;
            }

            return new classDefinition(this.app, data);
        }
    },
};

export default mixin;
