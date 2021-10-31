import MixinInterface from "../interface/MixinInterface";
import AppService from "../class/AppService";

const mixin: MixinInterface = {
    name: 'events',

    service: class extends AppService {
        forget(name, callback, el = window.document) {
            el.removeEventListener(name, callback);
        }

        listen(name, callback, el = window.document) {
            el.addEventListener(name, callback);
        }

        trigger(name, data, el = window.document) {
            el.dispatchEvent(
                new CustomEvent(name, {
                    detail: data,
                })
            );
        }
    },
};

export default mixin;
