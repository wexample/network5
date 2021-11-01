import MixinAssets from "./Assets";
import MixinEvents from "./Events";
import MixinQueues from "./Queues";
import MixinInterface from "../interfaces/MixinInterface";
import AssetsCollectionInterface from "../interfaces/AssetsCollectionInterface";
import Queue from "../class/Queue";
import AppService from "../class/AppService";
import MixinsAppService from "../class/MixinsAppService";
import LayoutRenderDataInterface from "../interfaces/LayoutRenderDataInterface";

const mixin: MixinInterface = {
    name: 'responsive',

    dependencies: {
        MixinAssets,
        MixinEvents,
        MixinQueues,
    },

    hooks: {
        app: {
            loadLayoutRenderData(data: LayoutRenderDataInterface, registry: any, next: Function) {
                if (registry.MixinAssets === MixinsAppService.LOAD_STATUS_COMPLETE
                    && registry.MixinQueues === MixinsAppService.LOAD_STATUS_COMPLETE) {
                    let responsiveService = this.app.getService('responsive');

                    responsiveService.updateResponsive(() => {
                        window.addEventListener(
                            'resize',
                            () => responsiveService.updateResponsive()
                        );

                        next();
                    });

                    return MixinsAppService.LOAD_STATUS_STOP;
                }

                return MixinsAppService.LOAD_STATUS_WAIT;
            },
        },
    },

    service: class extends AppService {
        public responsiveSizeCurrent: string
        public responsiveSizePrevious: string

        updateResponsive(complete?: Function) {
            let current = this.detectSize();

            this.responsiveSizePrevious = this.responsiveSizeCurrent;

            if (current !== this.responsiveSizePrevious) {
                this.responsiveSizeCurrent = current;

                let assetsService = this.app.getService('assets');
                assetsService.queue.reset()

                // Update layout level assets.
                this.updateResponsiveAssets(
                    this.app.registry.layoutData.assets.responsive,
                    () => {
                        // Update page level assets.
                        this.updateResponsiveAssets(
                            this.app.registry.layoutData.page.assets.responsive,
                            () => {
                                // Now change page class.
                                this.updateResponsiveLayoutClass();

                                this.app.getService('events')
                                    .trigger('responsive-change-size', {
                                        current: current,
                                        previous: this.responsiveSizePrevious,
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
        }

        updateResponsiveLayoutClass() {
            // Remove all responsive class names.
            let classList = document.body.classList;

            classList.remove(
                `responsive-${this.app.getService('responsive').responsiveSizePrevious}`
            );
            classList.add(
                `responsive-${this.app.getService('responsive').responsiveSizeCurrent}`
            );
        }

        updateResponsiveAssets(assetsCollection: AssetsCollectionInterface, complete) {
            let responsiveSize = this.app.getService('responsive').detectSize();
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
                    let assetsService = this.app.getService('assets');
                    // Load new assets.
                    let queueLoad = assetsService.appendAssets(toLoad);
                    // Remove old ones.
                    let queueUnLoad = assetsService.removeAssets(toUnload);

                    this.app.getService('queues').afterAllQueues(
                        [queueLoad, queueUnLoad],
                        complete
                    );
                } else {
                    this.app.async(complete);
                }
            }
        }

        breakpointSupports(letter) {
            return this.app.getService('responsive').detectSupported().hasOwnProperty(letter);
        }

        detectSupported() {
            let supported = {};
            Object.entries(this.app.registry.layoutData.displayBreakpoints).forEach((entry) => {
                if (window.innerWidth > entry[1]) {
                    supported[entry[0]] = entry[1];
                }
            });

            return supported;
        }

        detectSize() {
            return Object.entries(this.app.getService('responsive').detectSupported()).reduce(
                (prev, current) => {
                    // Return item that is the greater one.
                    return current[1] > prev[1] ? current : prev;
                }
            )[0];
        }
    },
};

export default mixin;