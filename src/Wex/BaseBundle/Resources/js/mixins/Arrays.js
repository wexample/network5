export default {
    name: 'arrays',

    hooks: {
        app: {
            loadRenderData(data, registry) {
                return 'complete';
            },
        },
    },

    methods: {
        app: {
            /**
             * Functions "arguments" object may be transformed to real array for extra manipulations.
             *
             * @param args
             * @returns {unknown[]}
             */
            fromArguments(args) {
                return Array.prototype.slice.call(args);
            },

            deleteItem(haystack, needle) {
                return this
                    .getMixin('arrays')
                    .deleteByIndex(haystack, haystack.indexOf(needle));
            },

            deleteByIndex(haystack, needle) {
                if (needle !== -1) {
                    haystack.splice(needle, 1);
                }
                return haystack;
            },

            shallowCopy(array) {
                return array.slice(0);
            }
        },
    },
};
