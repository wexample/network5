import MixinInterface from "../interface/MixinInterface";
import AppService from "../class/AppService";

const mixin: MixinInterface = {
    name: 'locale',

    hooks: {
        app: {
            loadRenderData() {
                return 'complete';
            },
        },
    },

    service: class extends AppService {
        transDomains: object = {}
    },
};

export default mixin;
