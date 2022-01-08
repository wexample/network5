import AppChild from "./AppChild";
import AssetsInterface from "../interfaces/AssetInterface";
import RenderNode from "./RenderNode";

export default abstract class RenderNodeUsage extends AppChild {
  public static USAGE_ANIMATION: string = 'animation';

  public static USAGE_COLOR_SCHEME: string = 'color-scheme';

  public static USAGE_INITIAL: string = 'initial';

  public static USAGE_RESPONSIVE: string = 'responsive';

  public static USAGE_SHAPE: string = 'shape';

  public static USAGES: string[] = [
    RenderNodeUsage.USAGE_ANIMATION,
    RenderNodeUsage.USAGE_COLOR_SCHEME,
    RenderNodeUsage.USAGE_INITIAL,
    RenderNodeUsage.USAGE_RESPONSIVE,
    RenderNodeUsage.USAGE_SHAPE,
  ];

  public abstract name: string;

  public hookAssetShouldBeLoaded(
    asset: AssetsInterface,
    renderNode: RenderNode
  ): boolean {
    return asset.usage === this.name;
  }
}
