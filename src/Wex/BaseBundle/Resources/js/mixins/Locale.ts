import MixinInterface from "../interface/MixinInterface";

const mixin:MixinInterface = {
    name: 'locale',

    hooks: {
        app: {
            loadRenderData() {
                return 'complete';
            },
        },
    },

    methods: {
        app: {
            transDomains: {},
        },
    },
};

export default mixin;
