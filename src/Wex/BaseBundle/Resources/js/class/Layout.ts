import Page from './Page';
import RenderNode from './RenderNode';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';

export default class extends RenderNode {
  public page: Page;

  public pageFocused?: Page;

  public renderData: RenderDataLayoutInterface;

  public getId(): string {
    return 'layout-' + this.renderData.renderRequestId;
  }

  public getRenderNodeType(): string {
    return 'layout';
  }
}
