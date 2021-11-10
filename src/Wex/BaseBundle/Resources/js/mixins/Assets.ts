import MixinQueues from './Queues';
import AssetsCollectionInterface from '../interfaces/AssetsCollectionInterface';
import MixinInterface from '../interfaces/MixinInterface';
import Queue from '../class/Queue';
import AppService from '../class/AppService';
import LayoutRenderDataInterface from '../interfaces/LayoutRenderDataInterface';
import MixinsAppService from '../class/MixinsAppService';
import Page from '../class/Page';
import AssetsInterface from '../interfaces/AssetInterface';

const mixin: MixinInterface = {
  name: 'assets',

  dependencies: {
    MixinQueues,
  },

  hooks: {
    app: {
      init() {
        // Only single queue for assets, for now.
        this.app.getService('assets').queue = this.app
          .getService('queues')
          .create('assets-loading');
      },

      loadLayoutRenderData(
        data: LayoutRenderDataInterface,
        registry: any,
        next: Function
      ) {
        // Load only layout assets.
        this.app.getService('assets').updateAssetsCollection(data.assets, next);

        return MixinsAppService.LOAD_STATUS_STOP;
      },
    },

    page: {
      loadPageRenderData(page: Page, registry: any, next: Function) {
        // Reload all assets, even layout ones.
        let assetsService = this.app.getService('assets');
        assetsService.updateAssets(next);

        return MixinsAppService.LOAD_STATUS_STOP;
      },
    },
  },

  service: class AssetsService extends AppService {
    public static UPDATE_FILTER_ACCEPT = 'accept';

    public static UPDATE_FILTER_REJECT = 'reject';

    queue: Queue;
    jsAssetsPending: object = {};
    updateFilters: Function[] = [];

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
            if (!asset.rendered) {
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

    forEachAssetInCollection(
      assetsCollection: AssetsCollectionInterface,
      callback
    ) {
      Object.entries(assetsCollection).forEach((data) =>
        data[1].map((asset) => callback(asset, data[0]))
      );
    }

    appendAssets(assetsCollection) {
      this.forEachAssetInCollection(assetsCollection, (asset) =>
        this.appendAsset(asset)
      );

      return this.queue;
    }

    removeAssets(assetsCollection) {
      this.forEachAssetInCollection(assetsCollection, (asset) =>
        this.removeAsset(asset)
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
      };

      if (asset.queue) {
        asset.queue.add(remove);
      } else {
        remove();
      }
    }

    setAssetLoaded(asset) {
      asset.loaded = true;
      asset.rendered = true;
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

    /**
     * By default accept to load all given assets, except any filter rejects it.
     */
    protected updateAssetsCollectionCallFilters(asset: AssetsInterface) {
      for (let filter of this.updateFilters) {
        if (filter(asset) === AssetsService.UPDATE_FILTER_REJECT) {
          return false;
        }
      }

      return true;
    }

    updateAssets(complete?: Function) {
      this.updateAssetsCollection(this.app.registry.layoutData.assets, () => {
        this.updateAssetsCollection(
          this.app.layoutPage.renderData.assets,
          complete
        );
      });
    }

    updateAssetsCollection(
      assetsCollection: AssetsCollectionInterface,
      complete?: Function
    ) {
      let toLoad = {};
      let toUnload = {};
      let hasChange = false;

      this.forEachAssetInCollection(
        assetsCollection,
        (asset: AssetsInterface) => {
          let type = asset.type;
          toLoad[type] = toLoad[type] || [];
          toUnload[type] = toUnload[type] || [];

          if (this.updateAssetsCollectionCallFilters(asset)) {
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
        }
      );

      if (hasChange) {
        let assetsService = this.app.getService('assets');
        assetsService.queue.reset();

        // Load new assets.
        let queueLoad = assetsService.appendAssets(toLoad);
        // Remove old ones.
        let queueUnLoad = assetsService.removeAssets(toUnload);

        if (complete) {
          this.app
            .getService('queues')
            .afterAllQueues([queueLoad, queueUnLoad], () => {
              complete();
            });
        }
      } else {
        complete && this.app.async(complete);
      }
    }
  },
};

export default mixin;
