import MixinQueues from "./Queues";
import AssetsCollectionInterface from "../interface/AssetsCollectionInterface";
import MixinInterface from "../interface/MixinInterface";
import Queue from "../class/Queue";

const mixin: MixinInterface = {
    name: 'assets',

    dependencies: {
        MixinQueues,
    },

    hooks: {
        app: {
            init() {
                // Only single queue for assets, for now.
                this.assets.queue = this.queues.create('assets-loading');
            },

            loadRenderData(data, registry) {
                if (registry.MixinQueues === 'complete') {
                    return 'complete';
                }
                return 'wait';
            },
        },
    },

    methods: {
        app: {
            queue: null,
            jsAssetsPending: {},

            appendAsset(asset, callback) {
                let queue: Queue = this.assets.queue;

                // Avoid currently and already loaded.
                if (!asset.active) {
                    // Active said that asset should be loaded,
                    // event loading is not complete or queue is terminated.
                    asset.active = true;
                    asset.queue = queue;

                    queue.add(() => {
                        if (asset.type === 'js') {
                            asset.el = this.assets.addScript(asset.path);

                            // Browsers does not load twice the JS file content.
                            if (!asset.loadedJs) {
                                this.assets.jsAssetsPending[asset.id] = asset;
                                // Stops queue unit class has been loaded.
                                return Queue.EXEC_STOP;
                            }
                        } else {
                            asset.el = this.assets.addStyle(asset.path);
                            this.assets.setAssetLoaded(asset);
                        }
                    });
                }

                if (callback) {
                    queue.then(callback);
                }

                return queue.start();
            },

            forEachAssetInCollection(assetsCollection: AssetsCollectionInterface, callback) {
                Object.entries(assetsCollection)
                    .forEach((data) =>
                        data[1].map((asset) => callback(asset, data[0]))
                    );
            },

            appendAssets(assetsCollection) {
                this.assets.forEachAssetInCollection(
                    assetsCollection,
                    (asset) => this.assets.appendAsset(asset)
                );

                return this.assets.queue;
            },

            removeAssets(assetsCollection) {
                this.assets.forEachAssetInCollection(
                    assetsCollection,
                    (asset) => this.assets.removeAsset(asset)
                );

                return this.assets.queue;
            },

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
            },

            setAssetLoaded(asset) {
                asset.loaded = true;
                asset.loadedJs = true;
                asset.queue = null;
            },

            jsPendingLoaded(id) {
                let asset = this.assets.jsAssetsPending[id];
                let queue = asset.queue;

                this.assets.setAssetLoaded(asset);

                queue.next();
                delete this.assets.jsAssetsPending[id];
            },

            addScript(src) {
                let el = document.createElement('script');
                el.src = src;

                document.head.appendChild(el);
                return el;
            },

            addStyle(href) {
                let el = this.assets.createStyleLinkElement();
                el.href = href;

                document.head.appendChild(el);
                return el;
            },

            createStyleLinkElement() {
                let el = document.createElement('link');
                el.setAttribute('rel', 'stylesheet');
                return el;
            },
        },
    },
};

export default mixin;
