import QueuesService from './Queues';
import AssetsCollectionInterface from '../interfaces/AssetsCollectionInterface';
import Queue from '../class/Queue';
import AppService from '../class/AppService';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';
import MixinsAppService from '../class/MixinsAppService';
import AssetsInterface from '../interfaces/AssetInterface';
import RenderNode from '../class/RenderNode';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export default class AssetsService extends AppService {
  public static UPDATE_FILTER_ACCEPT = 'accept';

  public static UPDATE_FILTER_REJECT = 'reject';

  public assetsRegistry: any = { css: {}, js: {} };
  public queue: Queue;
  public jsAssetsPending: object = {};
  public updateFilters: Function[] = [];
  public static dependencies: typeof AppService[] = [QueuesService];

  registerHooks() {
    return {
      app: {
        init() {
          // Only single queue for assets, for now.
          this.app.services.assets.queue =
            this.app.services.queues.create('assets-loading');
        },

        loadRenderData(
          renderData: RenderDataLayoutInterface,
          requestOptions: RequestOptionsInterface,
          registry: any,
          next: Function
        ) {
          // Load only layout assets.
          this.app.services.assets.updateAssetsCollection(
            renderData.assets,
            next
          );

          return MixinsAppService.LOAD_STATUS_STOP;
        },
      },
    };
  }

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

  enqueueAssetsUpdate(
    queue: Queue,
    assetsCollection: AssetsCollectionInterface
  ) {
    queue.add((next: Function) => {
      this.updateAssetsCollection(assetsCollection, next);
      return Queue.EXEC_STOP;
    });
  }

  enqueueRenderNodeAssetsUpdate(queue, renderNode: RenderNode) {
    // For main node.
    this.enqueueAssetsUpdate(queue, renderNode.renderData.assets);
    // For child nodes.
    renderNode.forEachChildRenderNode((renderNode) => {
      this.enqueueRenderNodeAssetsUpdate(queue, renderNode);
    });
  }

  updateAssets(complete?: Function) {
    // Only single queue for assets, for now.
    let queue = this.services.queues.create() as Queue;
    queue.isAsync = true;

    this.enqueueRenderNodeAssetsUpdate(queue, this.app.layout);

    queue.then(() => {
      complete && complete();
    });

    queue.start();
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
