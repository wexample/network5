import MixinLocale from './Locale';
import MixinInterface from "../interface/MixinInterface";
import Page from "../class/Page";
import AppService from "../class/AppService";

const mixin: MixinInterface = {
    name: 'pages',

    dependencies: {
        MixinLocale,
    },

    hooks: {
        app: {
            loadRenderData(data, registry) {
                if (registry.MixinResponsive === 'complete' && registry.MixinLocale === 'complete') {
                    this.app.getService('pages').create(data.page);
                    return 'complete';
                }
                return 'wait';
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
