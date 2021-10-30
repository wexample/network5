import MixinAssets from "./Assets";
import MixinEvents from "./Events";
import MixinQueues from "./Queues";
import MixinInterface from "../interface/MixinInterface";
import AssetsCollectionInterface from "../interface/AssetsCollectionInterface";
import Queue from "../class/Queue";

const mixin: MixinInterface = {
    name: 'responsive',

    dependencies: {
        MixinAssets,
        MixinEvents,
        MixinQueues,
    },

    hooks: {
        app: {
            loadRenderData(data, registry, next) {
                if (registry.MixinAssets === 'complete' && registry.MixinQueues === 'complete') {
                    let responsiveMixin = this.getMixin('responsive');

                    responsiveMixin.updateResponsive(() => {
                        window.addEventListener(
                            'resize',
                            () => responsiveMixin.updateResponsive()
                        );

                        next();
                    });

                    return 'stop';
                }

                return 'wait';
            },
        },
    },

    methods: {
        responsiveSizeCurrent: null,
        responsiveSizePrevious: null,

        app: {
            updateResponsive(complete?: Function) {
                let responsiveMixin = this.getMixin('responsive');
                let current = responsiveMixin.detectSize();

                responsiveMixin.responsiveSizePrevious = responsiveMixin.responsiveSizeCurrent;

                if (current !== responsiveMixin.responsiveSizePrevious) {
                    responsiveMixin.responsiveSizeCurrent = current;

                    let assetsMixin = this.getMixin('assets');
                    assetsMixin.queue.reset()

                    // Update layout level assets.
                    responsiveMixin.updateResponsiveAssets(
                        this.registry.layoutData.assets.responsive,
                        () => {
                            // Update page level assets.
                            responsiveMixin.updateResponsiveAssets(
                                this.registry.layoutData.page.assets.responsive,
                                () => {
                                    // Now change page class.
                                    responsiveMixin.updateResponsiveLayoutClass();

                                    this.getMixin('events')
                                        .trigger('responsive-change-size', {
                                            current: current,
                                            previous: responsiveMixin.responsiveSizePrevious,
                                        });

                                    complete && complete();
                                }
                            );

                            return Queue.EXEC_STOP;
                        }
                    );
                } else {
                    complete && complete();
                }
            },

            updateResponsiveLayoutClass() {
                // Remove all responsive class names.
                let classList = document.body.classList;

                classList.remove(
                    `responsive-${this.getMixin('responsive').responsiveSizePrevious}`
                );
                classList.add(
                    `responsive-${this.getMixin('responsive').responsiveSizeCurrent}`
                );
            },

            updateResponsiveAssets(assetsCollection: AssetsCollectionInterface, complete) {
                let responsiveSize = this.getMixin('responsive').detectSize();
                let toLoad = {};
                let toUnload = {};
                let hasChange = false;

                Object.entries(assetsCollection)
                    .forEach((data) => {
                        let assets = data[1];
                        let type = data[0];
                        toLoad[type] = toLoad[type] || [];
                        toUnload[type] = toUnload[type] || [];

                        assets.forEach((asset) => {
                            // Adding and removing assets is async.
                            if (asset.responsive === responsiveSize) {
                                if (!asset.active) {
                                    hasChange = true;
                                    toLoad[type].push(asset);
                                }
                            } else {
                                if (asset.active) {
                                    hasChange = true;
                                    toUnload[type].push(asset);
                                }
                            }
                        });
                    });

                if (complete) {
                    if (hasChange) {
                        // Load new assets.
                        let queueLoad = this.assets.appendAssets(toLoad);
                        // Remove old ones.
                        let queueUnLoad = this.assets.removeAssets(toUnload);

                        this.queues.afterAllQueues(
                            [queueLoad, queueUnLoad],
                            complete
                        );
                    } else {
                        this.async(complete);
                    }
                }
            },

            breakpointSupports(letter) {
                return this.getMixin('responsive').detectSupported().hasOwnProperty(letter);
            },

            detectSupported() {
                let supported = {};
                Object.entries(this.registry.layoutData.displayBreakpoints).forEach((entry) => {
                    if (window.innerWidth > entry[1]) {
                        supported[entry[0]] = entry[1];
                    }
                });

                return supported;
            },

            detectSize() {
                return Object.entries(this.getMixin('responsive').detectSupported()).reduce(
                    (prev, current) => {
                        // Return item that is the greater one.
                        return current[1] > prev[1] ? current : prev;
                    }
                )[0];
            },
        },
    },
};

export default mixin;