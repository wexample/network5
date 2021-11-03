import Page from './Page';

import MixinAssets from '../mixins/Assets';
import MixinInterface from "../interfaces/MixinInterface";
import MixinMixin from '../mixins/Mixins';
import MixinPage from '../mixins/Pages';
import MixinResponsive from '../mixins/Responsive';
import MixinTheme from "../mixins/Theme";

export default class {
    public bootJsBuffer: string[] = [];
    public hasCoreLoaded: boolean = false;
    public layoutPage: Page = null;
    public mixins: object;
    public readyCallbacks: Function[] = [];
    public elLayout: HTMLElement;
    public lib: object = {};
    public registry: any;
    public services: object = {};
    public isReady: boolean = false;

    constructor(readyCallback?: any | Function, globalName = 'app') {
        window[globalName] = this;

        this.registry = window['appRegistry'];

        // Allow callback as object definition.
        if (typeof readyCallback === 'object') {
            Object.assign(this, readyCallback);
            // Allow object.readyCallback property.
            readyCallback = readyCallback.readyCallback || readyCallback;
        }

        let doc = window.document;

        let run = () => {
            this.mixins = this.getMixinsAndDependencies(this.getMixins());

            Object.values(this.mixins).forEach((mixin: MixinInterface) => {
                if (mixin.service) {
                    this.services[mixin.name] = new mixin.service(this);
                }
            });

            let mixinService = this.getService('mixins');

            // Init mixins.
            mixinService.invokeUntilComplete('init', 'app', [], () => {
                this.elLayout = doc.getElementById('layout');

                this.addLibraries(this.lib);

                // The main functionalities are ready.
                this.hasCoreLoaded = true;

                // Load layout data.
                mixinService
                    .invokeUntilComplete(
                        'loadLayoutRenderData',
                        'app',
                        [this.registry.layoutData],
                        () => {
                            // Execute ready callbacks.
                            this.readyComplete();
                            // Display page content.
                            this.elLayout.classList.remove('layout-loading');
                            // Launch constructor argument callback.
                            readyCallback && readyCallback.apply(this);
                        });
            });
        };

        let readyState = doc.readyState;

        // Document has been parsed.
        // Allows running after loaded event.
        if (['complete', 'loaded', 'interactive'].indexOf(readyState) !== -1) {
            this.async(run);
        } else {
            doc.addEventListener('DOMContentLoaded', run);
        }
    }

    async(callback) {
        setTimeout(callback);
    }

    ready(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    readyComplete() {
        this.isReady = true;
        // Launch callbacks.
        this.callbacks(this.readyCallbacks);
    }

    /**
     * Execute an array of callbacks functions.
     */
    callbacks(callbacksArray, args = [], thisArg = null) {
        let method = args ? 'apply' : 'call';
        let callback = null;

        while (callback = callbacksArray.shift()) {
            if (!callback) {
                throw "Trying to execute undefined callback.";
            }

            callback[method](thisArg || this, args)
        }
    }

    getClassPage() {
        return Page;
    }

    getService(name) {
        return this.services[name];
    }

    getMixins() {
        return {
            ...{
                MixinAssets,
                MixinMixin,
                MixinPage,
                MixinResponsive,
                MixinTheme,
            }
        };
    }

    getMixinsAndDependencies(mixins) {
        Object.values(mixins).forEach((mixin: any) => {
            if (mixin.dependencies) {
                let dependencies = mixin.dependencies;

                mixins = {
                    ...mixins,
                    ...this.getMixinsAndDependencies(dependencies),
                };
            }
        })

        return mixins;
    }

    mix(parentDest, group, split = false) {
        Object.values(this.mixins).forEach((mixin) => {
            if (mixin.methods && mixin.methods[group]) {
                let dest;
                let toMix = mixin.methods[group];

                if (split) {
                    dest = {};
                    parentDest[mixin.name] = dest;
                } else {
                    dest = parentDest;
                }

                // Use a "one level deep merge" to allow mix groups of methods.
                for (let i in toMix) {
                    let value = toMix[i];

                    // Mix objects.
                    if (
                        value &&
                        value.constructor &&
                        value.constructor === Object
                    ) {
                        dest[i] = dest[i] || {};

                        Object.assign(dest[i], toMix[i]);
                    }
                    // Methods, bind it to main object.
                    else if (typeof value === 'function') {
                        dest[i] = toMix[i].bind(parentDest);
                    }
                    // Override others.
                    else {
                        dest[i] = toMix[i];
                    }
                }
            }
        });
    }

    /**
     * @param registryGroup
     * @param classRegistryName
     */
    getBundleClassDefinition(registryGroup: string, classRegistryName: string) {
        let bundle = this
            .registry
            .bundles[registryGroup]
            .classes[classRegistryName];

        return bundle ? bundle.definition : null;
    }

    addLib(name, object) {
        this.lib[name] = object;
    }

    addLibraries(libraries) {
        // Initialize preexisting libs.
        Object.entries(libraries).forEach((data) => {
            this.addLib(data[0], data[1]);
        });
    }
}
