import Page from './Page';
import RenderNode from './RenderNode';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';

export default class extends RenderNode {
  public page: Page;

  public pageFocused?: Page;

  public renderData: LayoutInterface;

  public getId(): string {
    return 'layout-' + this.renderData.renderRequestId;
  }

  public getRenderNodeType(): string {
    return 'layout';
  }
}
