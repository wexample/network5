import MixinLocale from '../mixins/Locale';

export default {
    name: 'page',

    dependencies: {
        MixinLocale,
    },

    hooks: {
        app: {
            loadAppData(data, registry) {
                if (registry.MixinLocale === 'complete') {
                    this.page.create(data.page);
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
                    'pages',
                    this.getClassPage(),
                    data.name
                );

                return new classDefinition(this, data);
            },
        },
    },
};
