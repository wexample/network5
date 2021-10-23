import MixinAssets from "./Assets";
import MixinQueues from "./Queues";

export default {
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
        app: {
            updateResponsive(complete) {
                this.responsive.updateResponsiveLayoutClass();

                this.responsive.updateResponsiveAssets(
                    this.registry.layoutData,
                    () => {
                        this.responsive.updateResponsiveAssets(
                            this.registry.layoutData.page,
                            complete
                        );
                    }
                );
            },

            updateResponsiveLayoutClass() {
                let responsiveSize = this.responsive.detectSize();

                // Remove all responsive class names.
                let classList = document.body.classList;
                classList.forEach((className) => {
                    if (className.indexOf('responsive-') === 0) {
                        classList.remove(className);
                    }
                });

                classList.add(
                    `responsive-${responsiveSize}`
                );
            },

            updateResponsiveAssets(renderData, complete) {
                let responsiveSize = this.responsive.detectSize();
                let toLoad = {};
                let toUnload = {};

                Object.entries(renderData.assets.responsive)
                    .forEach((data) => {
                        let assets = data[1];
                        let type = data[0];
                        toLoad[type] = toLoad[type] || [];
                        toUnload[type] = toUnload[type] || [];

                        assets.forEach((asset) => {
                            // Adding and removing assets is async.
                            if (asset.responsive === responsiveSize) {
                                if (!asset.active) {
                                    toLoad[type].push(asset);
                                }
                            } else {
                                if (asset.active) {
                                    toUnload[type].push(asset);
                                }
                            }
                        });
                    });

                // Load new assets.
                let queueLoad = this.assets.appendAssets(toLoad);
                // Remove old ones.
                let queueUnLoad = this.assets.removeAssets(toUnload)

                if (complete) {
                    this.queues.afterAllQueues(
                        [queueLoad, queueUnLoad],
                        complete
                    );
                }
            },

            breakpointSupports(letter) {
                return this.responsive.detectSupported().hasOwnProperty(letter);
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
                return Object.entries(this.responsive.detectSupported()).reduce(
                    (prev, current) => {
                        // Return item that is the greater one.
                        return current[1] > prev[1] ? current : prev;
                    }
                )[0];
            },
        },
    },
};
