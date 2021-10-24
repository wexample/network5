import Page from './Page';

import MixinAssets from '../mixins/Assets';
import MixinMixin from '../mixins/Mixin';
import MixinPage from '../mixins/Pages';
import MixinResponsive from '../mixins/Responsive';

export default class {
    public bootJsBuffer: string[] = [];
    public classesDefinitions: any = {};
    public hasCoreLoaded: boolean = false;
    public layoutPage: Page = null;
    public mixins: object;
    public readyCallbacks: Function[] = [];
    public elLayout: HTMLElement;
    public lib: object = {};
    public registry: any;
    public isReady: boolean = false;

    constructor(readyCallback, globalName = 'app') {
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
            this.mixins = this.getMixinAndDependencies(this.getMixins());

            this.mix(this, 'app', true);

            // Init mixins.
            this.getMixin('mixin').invokeUntilComplete('init', 'app', [], () => {
                this.elLayout = doc.getElementById('layout');

                this.addLibraries(this.lib);

                // The main functionalities are ready.
                this.hasCoreLoaded = true;

                // Load template data.
                this.loadRenderData(this.registry.layoutData, () => {
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
            setTimeout(run);
        } else {
            doc.addEventListener('DOMContentLoaded', run);
        }
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

        callbacksArray.forEach((item) => {
            if (!item) {
                throw "Trying to execute undefined callback.";
            }

            item[method](thisArg || this, args)
        });
    }

    loadRenderData(data, complete) {
        if (data.redirect) {
            document.location.replace(data.redirect.url);
            return;
        }

        // Use mixins hooks.
        this.getMixin('mixin').invokeUntilComplete('loadRenderData', 'app', [data], () => {
            complete && complete(data);
        });
    }

    getClassPage() {
        return Page;
    }

    getMixin(name) {
        // TODO For TypeScript compatibility.
        //  Mixins may be converted to services.
        return this[name];
    }

    getMixins() {
        return {
            ...{
                MixinAssets,
                MixinMixin,
                MixinPage,
                MixinResponsive,
            }
        };
    }

    getMixinAndDependencies(mixins) {
        Object.values(mixins).forEach((mixin: any) => {
            if (mixin.dependencies) {
                let dependencies = mixin.dependencies;

                mixins = {
                    ...mixins,
                    ...this.getMixinAndDependencies(dependencies),
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
     * @param baseClassDefinition
     * @param classRegistryName
     */
    getClassDefinition(registryGroup, baseClassDefinition, classRegistryName) {
        let key = `${registryGroup}.${classRegistryName}`;

        if (!this.classesDefinitions[key]) {
            let classDefinition = baseClassDefinition;
            let extraDefinition =
                this.registry[registryGroup]
                    .classes[classRegistryName];

            if (extraDefinition) {
                classDefinition = class extends baseClassDefinition {
                };

                Object.assign(classDefinition.prototype, extraDefinition);
                Object.assign(classDefinition, extraDefinition.static);
            }

            this.classesDefinitions[key] = classDefinition;
        }

        return this.classesDefinitions[key];
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
