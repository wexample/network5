import MixinInterface from "../interface/MixinInterface";
import AppService from "../class/AppService";
import MixinsAppService from "../class/MixinsAppService";

const mixin: MixinInterface = {
    name: 'locale',

    hooks: {
        app: {
            loadRenderData() {
                return MixinsAppService.LOAD_STATUS_COMPLETE;
            },
        },
    },

    service: class extends AppService {
        transDomains: object = {}
    },
};

export default mixin;
