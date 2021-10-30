import MixinLocale from './Locale';
import MixinInterface from "../interface/MixinInterface";
import Page from "../class/Page";

const mixin: MixinInterface = {
    name: 'pages',

    dependencies: {
        MixinLocale,
    },

    hooks: {
        app: {
            loadRenderData(data, registry) {
                if (registry.MixinResponsive === 'complete' && registry.MixinLocale === 'complete') {
                    this.pages.create(data.page);
                    return 'complete';
                }
                return 'wait';
            },
        },
    },

    methods: {
        app: {
            pages: {},

            create(data: any): Page {
                let classDefinition = this.getClassDefinition(
                    'page',
                    data.name
                );

                return new classDefinition(this, data);
            },
        },
    },
};

export default mixin;
