import { MixinQueues, QueuesService } from './Queues';
import AssetsCollectionInterface from '../interfaces/AssetsCollectionInterface';
import MixinInterface from '../interfaces/MixinInterface';
import Queue from '../class/Queue';
import AppService from '../class/AppService';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';
import MixinsAppService from '../class/MixinsAppService';
import Page from '../class/Page';
import AssetsInterface from '../interfaces/AssetInterface';

export class AssetsService extends AppService {
  public static UPDATE_FILTER_ACCEPT = 'accept';

  public static UPDATE_FILTER_REJECT = 'reject';

  public assetsRegistry: any = { css: {}, js: {} };
  public queue: Queue;
  public jsAssetsPending: object = {};
  public updateFilters: Function[] = [];

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
          // Browsers does not load twice the JS file content.
          if (!asset.rendered) {
            asset.el = this.addScript(asset.path);

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
      this.updatePageAssets(this.app.layoutPage, complete);
    });
  }

  updatePageAssets(page: Page, complete?: Function) {
    this.updateAssetsCollection(page.renderData.assets, complete);
  }

  updateAssetsCollection(
    assetsCollection: AssetsCollectionInterface,
    complete?: Function
  ) {
    let toLoad = {};
    let toUnload = {};
    let hasChange = false;
    let assetsRegistry = this.assetsRegistry;

    this.forEachAssetInCollection(
      assetsCollection,
      (asset: AssetsInterface) => {
        let type = asset.type;

        // Asset has already been loaded,
        // so it's local status may have been update,
        // so we always prefer local version.
        if (assetsRegistry[type][asset.name]) {
          asset = assetsRegistry[type][asset.name];
        }

        toLoad[type] = toLoad[type] || [];
        toUnload[type] = toUnload[type] || [];

        if (this.updateAssetsCollectionCallFilters(asset)) {
          if (!asset.active) {
            hasChange = true;
            toLoad[type].push(asset);
            assetsRegistry[type][asset.name] = asset;
          }
        } else {
          if (asset.active) {
            hasChange = true;
            toUnload[type].push(asset);
          }
        }
      }
    );

    if (hasChange || this.queue.commands.length) {
      let assetsService = this.services.assets;

      // Load new assets.
      let queueLoad = assetsService.appendAssets(toLoad);
      // Remove old ones.
      let queueUnLoad = assetsService.removeAssets(toUnload);

      if (complete) {
        this.services.queues.afterAllQueues([queueLoad, queueUnLoad], () => {
          complete();
        });
      }
    } else {
      complete && this.app.async(complete);
    }
  }
}

export const MixinAssets: MixinInterface = {
  name: 'assets',

  dependencies: [MixinQueues],

  hooks: {
    app: {
      init() {
        // Only single queue for assets, for now.
        this.app.services.assets.queue =
          this.app.services.queues.create('assets-loading');
      },

      loadRenderData(
        data: RenderDataLayoutInterface,
        registry: any,
        next: Function
      ) {
        // Load only layout assets.
        this.app.services.assets.updateAssetsCollection(data.assets, next);

        return MixinsAppService.LOAD_STATUS_STOP;
      },
    },

    page: {
      loadPageRenderData(page: Page, registry: any, next: Function) {
        this.app.services.assets.updatePageAssets(page, next);

        return MixinsAppService.LOAD_STATUS_STOP;
      },
    },
  },

  service: AssetsService,
};
