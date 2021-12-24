import AssetsCollectionInterface from '../interfaces/AssetsCollectionInterface';
import AppService from '../class/AppService';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';
import AssetInterface from '../interfaces/AssetInterface';
import RenderNode from '../class/RenderNode';
import { Attribute, AttributeValue, TagName } from '../helpers/Dom';

export class AssetsServiceType {
  public static CSS: string = 'css';

  public static JS: string = 'js';
}

export default class AssetsService extends AppService {
  public static UPDATE_FILTER_ACCEPT = 'accept';

  public static UPDATE_FILTER_REJECT = 'reject';

  public assetsRegistry: AssetsCollectionInterface =
    this.createEmptyAssetsCollection();
  public jsAssetsPending: { [key: string]: AssetInterface } = {};
  public updateFilters: Function[] = [];

  registerHooks() {
    return {
      app: {
        init() {
          this.app.services.assets.appInit();
        },

        async loadRenderData(renderData: LayoutInterface) {
          // Load only layout assets.
          await this.app.services.assets.loadValidAssetsInCollection(
            renderData.assets
          );
        },
      },
    };
  }

  appInit() {
    // Wait for all render node tree to be properly set.
    this.app.ready(() => {
      // Mark all initially rendered assets in layout as loaded.
      this.app.layout.forEachRenderNode((renderNode: RenderNode) =>
        this.assetsInCollection(renderNode.renderData.assets).forEach(
          (asset) => {
            if (asset.initial) {
              this.setAssetLoaded(asset);
            }
          }
        )
      );
    });
  }

  appendAsset(asset: AssetInterface) {
    return new Promise(async (resolve) => {
      // Storing resolver allow javascript to be,
      // marked as loaded asynchronously.
      asset.resolver = resolve;

      // Avoid currently and already loaded.
      if (!asset.active) {
        // Active said that asset should be loaded,
        // event loading is not complete or queue is terminated.
        asset.active = true;

        if (asset.type === 'js') {
          // Browsers does not load twice the JS file content.
          if (!asset.rendered) {
            this.jsAssetsPending[asset.id] = asset;
            asset.el = this.addScript(asset.path);

            // Javascript file will run resolve.
            return;
          }
        } else {
          if (!asset.loaded) {
            asset.el = this.addStyle(asset.path);
          }
        }
      }

      resolve(asset);
    }).then((asset: AssetInterface) => {
      this.setAssetLoaded(asset);
    });
  }

  assetsInCollection(
    assetsCollection: AssetsCollectionInterface
  ): AssetInterface[] {
    let asset: AssetInterface;
    let data;
    let entries = Object.entries(assetsCollection);
    let output = [];

    for (data of entries) {
      for (asset of data[1]) {
        output.push(asset);
      }
    }

    return output;
  }

  async appendAssets(assetsCollection) {
    return new Promise(async (resolveAll) => {
      let count: number = 0;
      let assets = this.assetsInCollection(assetsCollection);

      if (!assets.length) {
        resolveAll(assets);
        return;
      }

      assets.forEach((asset) => {
        count++;

        new Promise(async (resolve) => {
          this.appendAsset(asset).then((asset) => {
            count--;
            resolve(asset);

            if (count === 0) {
              resolveAll(assetsCollection);
            }
          });
        });
      });
    });
  }

  removeAssets(assetsCollection) {
    this.assetsInCollection(assetsCollection).forEach((asset) =>
      this.removeAsset(asset)
    );
  }

  removeAsset(asset: AssetInterface) {
    asset.active = false;
    asset.loaded = false;

    if (asset.el) {
      // Remove from document.
      asset.el.remove();
      asset.el = null;
    }
  }

  setAssetLoaded(asset: AssetInterface) {
    asset.loaded = true;
    asset.rendered = true;
  }

  jsPendingLoaded(id) {
    let asset = this.jsAssetsPending[id];
    asset.resolver(asset);

    delete this.jsAssetsPending[id];
  }

  addScript(src: string) {
    let el = document.createElement(TagName.SCRIPT);
    el.setAttribute(Attribute.SRC, src);

    document.head.appendChild(el);
    return el;
  }

  addStyle(href: string) {
    let el = this.createStyleLinkElement();
    el.setAttribute(Attribute.HREF, href);

    document.head.appendChild(el);
    return el;
  }

  createStyleLinkElement() {
    let el = document.createElement(TagName.LINK);
    el.setAttribute(Attribute.REL, AttributeValue.STYLESHEET);
    return el;
  }

  /**
   * By default accept to load all given assets, except any filter rejects it.
   */
  protected askFilterIfAssetIsValid(asset: AssetInterface) {
    let filter: Function;

    for (filter of this.updateFilters) {
      if (filter(asset) === AssetsService.UPDATE_FILTER_REJECT) {
        return false;
      }
    }

    return true;
  }

  async updateRenderNodeAssets(renderNode: RenderNode) {
    // For main node.
    await this.loadValidAssetsInCollection(renderNode.renderData.assets);
    // For child nodes.
    renderNode.forEachChildRenderNode(
      async (renderNode) => await this.updateRenderNodeAssets(renderNode)
    );
  }

  async updateLayoutAssets() {
    await this.updateRenderNodeAssets(this.app.layout);
  }

  public createEmptyAssetsCollection(): AssetsCollectionInterface {
    return {
      css: [],
      js: [],
    };
  }

  public async loadValidAssetsInCollection(
    assetsCollection: AssetsCollectionInterface
  ) {
    let toLoad = this.createEmptyAssetsCollection();
    let toUnload = this.createEmptyAssetsCollection();
    let hasChange = false;
    let assetsRegistry = this.assetsRegistry;

    this.assetsInCollection(assetsCollection).forEach(
      (asset: AssetInterface) => {
        let type = asset.type;

        // Asset object may come from a fresh xhr load,
        // and represent an existing but locally updated version.
        // We always prefer local version.
        if (assetsRegistry[type][asset.id]) {
          asset = assetsRegistry[type][asset.id];
        } else {
          assetsRegistry[type][asset.id] = asset;
        }

        if (this.askFilterIfAssetIsValid(asset)) {
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
      // Load new assets.
      await this.appendAssets(toLoad);
      // Remove old ones.
      this.removeAssets(toUnload);
    }
  }
}
