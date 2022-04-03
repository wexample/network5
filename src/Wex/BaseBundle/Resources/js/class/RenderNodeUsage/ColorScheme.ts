import RenderNodeUsage from '../RenderNodeUsage';
import RenderNode from '../RenderNode';
import AssetsInterface from '../../interfaces/AssetInterface';

export default class extends RenderNodeUsage {
  public name: string = RenderNodeUsage.USAGE_COLOR_SCHEME;

  hookAssetShouldBeLoaded(
    asset: AssetsInterface,
    renderNode: RenderNode
  ): boolean {
    return asset.colorScheme === null
      || asset.colorScheme === renderNode.colorSchemeGet();
  }
}