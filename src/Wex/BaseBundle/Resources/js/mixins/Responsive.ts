import MixinAssets from "./Assets";
import MixinQueues from "./Queues";
import RenderDataInterface from "../interface/RenderDataInterface";
import MixinInterface from "../interface/MixinInterface";

const mixin: MixinInterface = {
    name: 'responsive',

    dependencies: {
        MixinAssets,
        MixinQueues,
    },

    hooks: {
        app: {
            loadRenderData(data, registry, next) {
                if (registry.MixinAssets === 'complete' && registry.MixinQueues === 'complete') {
                    window.addEventListener(
                        'resize',
                        () => this.responsive.updateResponsive()
                    );

                    this.responsive.updateResponsive(next);

                    return 'stop';
                }

                return 'wait';
            },
        },
    },

    methods: {
        responsiveSizeCurrent: null,

        app: {
            updateResponsive(complete?: Function) {
                this.responsive.updateResponsiveLayoutClass();

                // Update layout level assets.
                this.responsive.updateResponsiveAssets(
                    this.registry.layoutData,
                    () => {
                        // Update page level assets.
                        this.responsive.updateResponsiveAssets(
                            this.registry.layoutData.page,
                            complete
                        );
                    }
                );
            },

            updateResponsiveLayoutClass() {
                let current = this.responsive.responsiveSizeCurrent;
                let responsiveSize = this.responsive.detectSize();

                if (current !== responsiveSize) {
                    // Remove all responsive class names.
                    let classList = document.body.classList;

                    classList.remove(
                        `responsive-${current}`
                    );
                    classList.add(
                        `responsive-${responsiveSize}`
                    );

                    this.responsive.responsiveSizeCurrent = responsiveSize;

                    if (this.layoutPage) {
                        this.layoutPage.onChangeResponsiveSize(
                            this.responsive.responsiveSizeCurrent,
                            current
                        );
                    }
                }
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

                // Load new assets.
                let queueLoad = this.assets.appendAssets(toLoad);
                // Remove old ones.
                let queueUnLoad = this.assets.removeAssets(toUnload);

                if (complete) {
                    if (hasChange) {
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