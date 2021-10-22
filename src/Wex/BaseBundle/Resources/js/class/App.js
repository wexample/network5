import Page from '../class/Page';

import MixinAssets from '../mixins/Assets';
import MixinDebug from '../mixins/Debug';
import MixinMixin from '../mixins/Mixin';
import MixinPage from '../mixins/Page';
import MixinResponsive from '../mixins/Responsive';

export default class {
    constructor(readyCallback, globalName = 'app') {
        window[globalName] = this;

        Object.assign(this, {
            classesDefinitions: {},
            isReady: false,
            lib: {},
            mixins: null,
            readyCallbacks: [],
            registry: window.appRegistry,
        });

        // Allow callback as object definition.
        if (typeof readyCallback === 'object') {
            Object.assign(this, readyCallback);
            // Allow object.readyCallback property.
            readyCallback = this.readyCallback || readyCallback;
        }

        let doc = window.document;

        let run = () => {
            this.mixins = this.getMixinAndDependencies(this.getMixins());

            this.mix(this, 'app', true);

            // Init mixins.
            this.mixin.invokeUntilComplete('init', 'app', [], () => {
                this.elLayout = doc.getElementById('layout');

                this.addLibraries(this.lib);

                // Load template data.
                this.loadAppData(this.registry.layoutData, () => {
                    // Execute ready callbacks.
                    this.readyComplete();
                    // Display page content.
                    this.elLayout.classList.remove('loading');
                    // Launch constructor argument callback.
                    readyCallback && readyCallback.apply(this);
                });
            });
        };

        let readyState = doc.readyState;

        // Document has been parsed.
        // Allows running after loaded event.
        if (readyState === 'complete' ||
            readyState === 'loaded' ||
            // But all resources have not been loaded.
            readyState === 'interactive'
        ) {
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
    callbacks(callbacksArray, args, thisArg) {
        // Only use apply function in case of existing args,
        // call function if faster than apply, even with argument check.
        for (
            let method = args ? 'apply' : 'call', item, i = 0;
            (item = callbacksArray[i++]);
        ) {
            item[method](thisArg || this, args);
        }
    }

    loadAppData(data, complete) {
        if (data.redirect) {
            document.location.replace(data.redirect.url);
            return;
        }

        // Use mixins hooks.
        this.mixin.invokeUntilComplete('loadAppData', 'app', [data], () => {
            complete && complete(data);
        });
    }

    getClassPage() {
        return Page;
    }

    getMixins() {
        let mixins = {
            ...{
                MixinAssets,
                // MixinLazy,
                MixinMixin,
                MixinPage,
                MixinResponsive,
            },
            // Append page specific mixins.
            ...(window.pageCurrent || this.getClassPage()).getPageLevelMixins(),
        };

        if (this.registry.layoutData.env === 'local') {
            mixins = {
                ...mixins,
                ...{
                    MixinDebug,
                },
            };
        }

        return mixins;
    }

    getMixinAndDependencies(mixins) {
        for (let mixin of Object.values(mixins)) {
            if (mixin.dependencies) {
                let dependencies = mixin.dependencies;
                this.getMixinAndDependencies(dependencies);
                mixins = {
                    ...mixins,
                    ...dependencies,
                };
            }
        }

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
