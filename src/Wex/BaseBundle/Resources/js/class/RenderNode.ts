import RenderDataInterface from "../interfaces/RenderDataInterface";
import AppChild from "./AppChild";
import App from "./App";

export default abstract class RenderNode extends AppChild {
  public childRenderNodes: { [key: string]: RenderNode } = {};
  public renderData: RenderDataInterface
  public id: string;
  public parentRenderNode: RenderNode;

  constructor(app: App, parentRenderNode: RenderNode = null) {
    super(app);

    if (parentRenderNode) {
      this.parentRenderNode = parentRenderNode;
    } else {
      // Append to initial layout.
      this.parentRenderNode = this.app.layout;
    }
  }

  init(renderData: RenderDataInterface) {
    this.renderData = renderData;

    if (this.parentRenderNode) {
      this.parentRenderNode.childRenderNodes[this.getId()] = this;
    }
  }

  forEachChildRenderNode(callback?: Function) {
    Object.values(this.childRenderNodes).forEach((renderNode) => callback(renderNode));
  }

  public abstract getId(): string;

  public abstract getRenderNodeType(): string;
}
