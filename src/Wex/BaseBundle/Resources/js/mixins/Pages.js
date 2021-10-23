import MixinLocale from '../mixins/Locale';

export default {
    name: 'pages',

    dependencies: {
        MixinLocale,
    },

    hooks: {
        app: {
            loadRenderData(data, registry) {
                if (registry.MixinLocale === 'complete') {
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

            create(data) {
                let classDefinition = this.getClassDefinition(
                    'page',
                    this.getClassPage(),
                    data.name
                );

                return new classDefinition(this, data);
            },
        },
    },
};
