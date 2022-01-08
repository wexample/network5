import AssetsCollectionInterface from '../interfaces/AssetsCollectionInterface';
import AppService from '../class/AppService';
import AssetInterface from '../interfaces/AssetInterface';
import RenderNode from '../class/RenderNode';
import { Attribute, AttributeValue, TagName } from '../helpers/Dom';
import AssetsInterface from '../interfaces/AssetInterface';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RenderNodeService from './RenderNodeService';
import MixinsAppService from '../class/MixinsAppService';
import RenderNodeUsage from '../class/RenderNodeUsage';

export class AssetsServiceType {
  public static CSS: string = 'css';

  public static JS: string = 'js';
}

export default class AssetsService extends AppService {
  public assetsRegistry: any = { css: {}, js: {} };

  public static dependencies: typeof AppService[] = [RenderNodeService];

  public jsAssetsPending: { [key: string]: AssetInterface } = {};

  registerMethods() {
    return {
      renderNode: {
        async assetsUpdate(usage: string) {
          await this.app.services.assets.loadValidAssetsForRenderNode(
            this,
            usage
          );
        },
      },
    };
  }

  registerHooks() {
    return {
      app: {
        hookInit() {
          this.app.services.assets.appInit();
        },

        async hookPrepareRenderData(renderData: RenderDataInterface) {
          renderData.assets = this.registerAssetsInCollection(
            renderData.assets
          );
        },
      },

      renderNode: {
        async hookBeforeCreate(
          definitionName: string,
          renderData: RenderDataInterface
        ) {
          await this.services.assets.loadValidAssetsInCollection(
            renderData.assets,
            RenderNodeUsage.USAGE_INITIAL
          );
        },

        async hookMounted(renderNode: RenderNode, registry: any) {
          // Wait for responsive to be loaded before assets.
          // The current responsive should be detected to allow
          // selecting proper responsive assets.
          if (registry.responsive !== MixinsAppService.LOAD_STATUS_COMPLETE) {
            return MixinsAppService.LOAD_STATUS_WAIT;
          }

          await this.services.assets.loadValidAssetsForRenderNode(
            renderNode,
            // TODO Load all non initial assets.
            RenderNodeUsage.USAGE_RESPONSIVE
          );
        },
      },
    };
  }

  appInit() {
    // Wait for all render node tree to be properly set.
    this.app.ready(async () => {
      // Mark all initially rendered assets in layout as loaded.
      await this.app.layout.forEachTreeRenderNode(
        async (renderNode: RenderNode) =>
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

  appendAsset(asset: AssetInterface): Promise<AssetsInterface> {
    return new Promise(async (resolve) => {
      // Avoid currently and already loaded.
      if (!asset.active) {
        // Active said that asset should be loaded,
        // event loading is not complete or queue is terminated.
        asset.active = true;

        // Storing resolver allow javascript to be,
        // marked as loaded asynchronously.
        asset.resolver = resolve;

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

      return asset;
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
      let assets = this.assetsInCollection(assetsCollection);

      if (!assets.length) {
        resolveAll(assets);
        return;
      }

      let count: number = 0;
      assets.forEach((asset: AssetsInterface) => {
        count++;

        this.appendAsset(asset).then(() => {
          count--;

          if (count === 0) {
            resolveAll(assetsCollection);
          }
        });
      });
    });
  }

  registerAssetsInCollection(
    assetsCollection: AssetsCollectionInterface
  ): AssetsCollectionInterface {
    let outputCollection = AssetsService.createEmptyAssetsCollection();

    this.assetsInCollection(assetsCollection).forEach((asset) =>
      outputCollection[asset.type].push(this.registerAsset(asset))
    );

    return outputCollection;
  }

  registerAsset(asset: AssetsInterface): AssetInterface {
    // Each asset has a unique reference object shared between all render node.
    if (!this.assetsRegistry[asset.type][asset.id]) {
      this.assetsRegistry[asset.type][asset.id] = asset;
    }

    return this.assetsRegistry[asset.type][asset.id];
  }

  removeAssets(assetsCollection: AssetsCollectionInterface) {
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

  public static createEmptyAssetsCollection(): AssetsCollectionInterface {
    return {
      css: [],
      js: [],
    };
  }

  public async loadValidAssetsInCollection(
    collection: AssetsCollectionInterface,
    usage: string,
    renderNode?: RenderNode
  ) {
    let toLoad = AssetsService.createEmptyAssetsCollection();
    let toUnload = AssetsService.createEmptyAssetsCollection();
    let hasChange = false;

    this.assetsInCollection(collection).forEach((asset: AssetInterface) => {
      if (asset.usage !== usage) {
        return;
      }

      let type = asset.type;

      if (
        this.app.services.renderNode.usages[
          asset.usage
        ].hookAssetShouldBeLoaded(asset, renderNode)
      ) {
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

    if (hasChange) {
      // Load new assets.
      await this.appendAssets(toLoad);
      // Remove old ones.
      this.removeAssets(toUnload);
    }
  }

  public async loadValidAssetsForRenderNode(
    renderNode: RenderNode,
    usage: string
  ) {
    await this.loadValidAssetsInCollection(
      renderNode.renderData.assets,
      usage,
      renderNode
    );
  }
}
