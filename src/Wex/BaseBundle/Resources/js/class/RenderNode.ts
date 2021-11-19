import RenderDataInterface from "../interfaces/RenderDataInterface";
import AppChild from "./AppChild";
import App from "./App";

export default abstract class RenderNode extends AppChild {
  public autoActivateListeners: boolean = true;
  public childRenderNodes: { [key: string]: RenderNode } = {};
  public el: HTMLElement;
  protected focused: boolean = false;
  public id: string;
  public parentRenderNode: RenderNode;
  public renderData: RenderDataInterface

  constructor(app: App, parentRenderNode: RenderNode = null) {
    super(app);

    if (parentRenderNode) {
      this.parentRenderNode = parentRenderNode;
    } else {
      // Append to initial layout.
      this.parentRenderNode = this.app.layout;
    }
  }

  loadRenderData(renderData: RenderDataInterface) {
    this.renderData = renderData;

    if (this.parentRenderNode) {
      this.parentRenderNode.childRenderNodes[this.getId()] = this;
    }
  }

  forEachChildRenderNode(callback?: Function) {
    Object.values(this.childRenderNodes).forEach((renderNode) => callback(renderNode));
  }

  public focus() {
    if (this.parentRenderNode) {
      this.parentRenderNode.blur();
    }

    this.focused = true;
    this.activateListeners();
  }

  public blur() {
    if (this.parentRenderNode) {
      this.parentRenderNode.focus();
    }

    this.focused = false;
    this.deactivateListeners();
  }

  protected activateListeners(): void {
    // To override...
  }

  protected deactivateListeners(): void {
    // To override...
  }

  public abstract getId(): string;

  public abstract getRenderNodeType(): string;
}
