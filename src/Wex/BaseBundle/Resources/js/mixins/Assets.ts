import MixinQueues from "./Queues";
import AssetsCollectionInterface from "../interface/AssetsCollectionInterface";
import MixinInterface from "../interface/MixinInterface";
import Queue from "../class/Queue";
import AppService from "../class/AppService";

const mixin: MixinInterface = {
    name: 'assets',

    dependencies: {
        MixinQueues,
    },

    hooks: {
        app: {
            init() {
                // Only single queue for assets, for now.
                this.app.getService('assets').queue =
                    this.app.getService('queues').create('assets-loading');
            },

            loadRenderData(data, registry) {
                if (registry.MixinQueues === 'complete') {
                    return 'complete';
                }
                return 'wait';
            },
        },
    },

    service: class extends AppService {
        queue: Queue
        jsAssetsPending: object = {}

        appendAsset(asset, callback: Function = null) {
            let queue: Queue = this.queue;

            // Avoid currently and already loaded.
            if (!asset.active) {
                // Active said that asset should be loaded,
                // event loading is not complete or queue is terminated.
                asset.active = true;
                asset.queue = queue;

                queue.add(() => {
                    if (asset.type === 'js') {
                        asset.el = this.addScript(asset.path);

                        // Browsers does not load twice the JS file content.
                        if (!asset.loadedJs) {
                            this.jsAssetsPending[asset.id] = asset;
                            // Stops queue unit class has been loaded.
                            return Queue.EXEC_STOP;
                        }
                    } else {
                        asset.el = this.addStyle(asset.path);
                        this.setAssetLoaded(asset);
                    }
                });
            }

            if (callback) {
                queue.then(callback);
            }

            return queue.start();
        }

        forEachAssetInCollection(assetsCollection: AssetsCollectionInterface, callback) {
            Object.entries(assetsCollection)
                .forEach((data) =>
                    data[1].map((asset) => callback(asset, data[0]))
                );
        }

        appendAssets(assetsCollection) {
            this.forEachAssetInCollection(
                assetsCollection,
                (asset) => this.appendAsset(asset)
            );

            return this.queue;
        }

        removeAssets(assetsCollection) {
            this.forEachAssetInCollection(
                assetsCollection,
                (asset) => this.removeAsset(asset)
            );

            return this.queue;
        }

        removeAsset(asset) {
            let remove = () => {
                asset.active = false;
                asset.loaded = false;

                if (asset.el) {
                    // Remove from document.
                    asset.el.parentNode.removeChild(asset.el);
                    asset.el = null;
                }
            }

            if (asset.queue) {
                asset.queue.add(remove);
            } else {
                remove();
            }
        }

        setAssetLoaded(asset) {
            asset.loaded = true;
            asset.loadedJs = true;
            asset.queue = null;
        }

        jsPendingLoaded(id) {
            let asset = this.jsAssetsPending[id];
            let queue = asset.queue;

            this.setAssetLoaded(asset);

            queue.next();
            delete this.jsAssetsPending[id];
        }

        addScript(src) {
            let el = document.createElement('script');
            el.src = src;

            document.head.appendChild(el);
            return el;
        }

        addStyle(href) {
            let el = this.createStyleLinkElement();
            el.href = href;

            document.head.appendChild(el);
            return el;
        }

        createStyleLinkElement() {
            let el = document.createElement('link');
            el.setAttribute('rel', 'stylesheet');
            return el;
        }
    },
};

export default mixin;
