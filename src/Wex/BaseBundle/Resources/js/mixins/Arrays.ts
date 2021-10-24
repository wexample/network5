import RenderDataInterface from "../interface/RenderDataInterface";
import MixinInvocationRegistryInterface from "../interface/MixinInvocationRegistryInterface";
import MixinInterface from "../interface/MixinInterface";

const mixin:MixinInterface = {
    name: 'arrays',

    hooks: {
        app: {
            loadRenderData(data: RenderDataInterface, registry: MixinInvocationRegistryInterface) {
                return 'complete';
            },
        },
    },

    methods: {
        app: {
            /**
             * Functions "arguments" object may be transformed to real array for extra manipulations.
             */
            fromArguments(args: unknown[]) {
                return Array.prototype.slice.call(args);
            },

            deleteItem(haystack: unknown[], needle: unknown) {
                return this
                    .getMixin('arrays')
                    .deleteByIndex(haystack, haystack.indexOf(needle));
            },

            deleteByIndex(haystack: unknown[], needle: number) {
                if (needle !== -1) {
                    haystack.splice(needle, 1);
                }
                return haystack;
            },

            shallowCopy(array: unknown[]) {
                return array.slice(0);
            }
        },
    },
};

export default mixin;
