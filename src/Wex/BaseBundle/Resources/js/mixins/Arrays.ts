import RenderDataInterface from "../interface/RenderDataInterface";
import ServiceInvocationRegistryInterface from "../interface/ServiceInvocationRegistryInterface";
import MixinInterface from "../interface/MixinInterface";
import AppService from "../class/AppService";
import MixinsAppService from "../class/MixinsAppService";

const mixin: MixinInterface = {
    name: 'arrays',

    hooks: {
        app: {
            loadRenderData(data: RenderDataInterface, registry: ServiceInvocationRegistryInterface) {
                return MixinsAppService.LOAD_STATUS_COMPLETE;
            },
        },
    },

    service: class extends AppService {
        /**
         * Functions "arguments" object may be transformed to real array for extra manipulations.
         */
        fromArguments(args: unknown[]) {
            return Array.prototype.slice.call(args);
        }

        deleteItem(haystack: unknown[], needle: unknown) {
            return this
                .app
                .getService('arrays')
                .deleteByIndex(haystack, haystack.indexOf(needle));
        }

        deleteByIndex(haystack: unknown[], needle: number) {
            if (needle !== -1) {
                haystack.splice(needle, 1);
            }
            return haystack;
        }

        shallowCopy(array: unknown[]) {
            return array.slice(0);
        }
    },
};

export default mixin;
