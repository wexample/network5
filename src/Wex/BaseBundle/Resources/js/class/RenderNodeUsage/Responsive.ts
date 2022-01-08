import RenderNodeUsage from '../RenderNodeUsage';
import AssetsInterface from '../../interfaces/AssetInterface';
import RenderNode from '../RenderNode';

export default class extends RenderNodeUsage {
  public name: string = RenderNodeUsage.USAGE_RESPONSIVE;

  hookAssetShouldBeLoaded(
    asset: AssetsInterface,
    renderNode: RenderNode
  ): boolean {
    if (
      asset.responsive !== null &&
      asset.responsive !== renderNode.responsiveSizeCurrent
    ) {
      return false;
    }

    return true;
  }
}
