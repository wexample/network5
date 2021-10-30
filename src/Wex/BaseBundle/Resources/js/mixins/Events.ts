import MixinInterface from "../interface/MixinInterface";

const mixin: MixinInterface = {
    name: 'events',

    methods: {
        app: {
            forget(name, callback, el = window.document) {
                el.removeEventListener(name, callback);
            },

            listen(name, callback, el = window.document) {
                el.addEventListener(name, callback);
            },

            trigger(name, data, el = window.document) {
                el.dispatchEvent(
                    new CustomEvent(name, {
                        detail: data,
                    })
                );
            },
        },
    },
};

export default mixin;
