import MixinAssets from "./Assets";
import MixinEvents from "./Events";
import MixinQueues from "./Queues";
import MixinInterface from "../interfaces/MixinInterface";
import AssetsCollectionInterface from "../interfaces/AssetsCollectionInterface";
import Queue from "../class/Queue";
import AppService from "../class/AppService";
import MixinsAppService from "../class/MixinsAppService";
import AssetsInterface from "../interfaces/AssetInterface";

const mixin: MixinInterface = {
    name: 'responsive',

    dependencies: {
        MixinAssets,
        MixinEvents,
        MixinQueues,
    },

    hooks: {
        app: {
            init(registry: any) {
                if (registry.MixinAssets === MixinsAppService.LOAD_STATUS_COMPLETE) {
                    let assetsService = this.app.getService('assets');
                    let responsiveService = this.app.getService('responsive');

                    assetsService.updateFilters.push(responsiveService.updateFilters.bind(responsiveService));

                    window.addEventListener(
                        'resize',
                        () => responsiveService.updateResponsive(true)
                    );

                    responsiveService.updateResponsive(false);

                    return MixinsAppService.LOAD_STATUS_COMPLETE;
                }

                return MixinsAppService.LOAD_STATUS_WAIT;
            },
        },
    },

    service: class extends AppService {
        public responsiveSizeCurrent: string
        public responsiveSizePrevious: string

        updateResponsive(updateAssets: boolean, complete?: Function) {
            let current = this.detectSize();

            this.responsiveSizePrevious = this.responsiveSizeCurrent;

            if (current !== this.responsiveSizePrevious) {
                this.responsiveSizeCurrent = current;

                if (updateAssets) {
                    let assetsService = this.app.getService('assets');
                    assetsService.updateAssets(() => {
                        // Now change page class.
                        this.updateResponsiveLayoutClass();

                        this.app.getService('events')
                            .trigger('responsive-change-size', {
                                current: current,
                                previous: this.responsiveSizePrevious,
                            });

                        complete && complete();
                    });
                }
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

        updateFilters(asset: AssetsInterface) {
            if (
                asset.responsive !== null
                && asset.responsive !== this.responsiveSizeCurrent
            ) {
                return 'reject';
            }
        }
    },
};

export default mixin;