import RenderDataInterface from "../interfaces/RenderDataInterface";
import AppChild from "./AppChild";
import App from "./App";

export default abstract class RenderNode extends AppChild {
  public childRenderNodes: { [key: string]: RenderNode } = {};
  public el: HTMLElement;
  protected focused: boolean = false;
  public id: string;
  public parentRenderNode: RenderNode;
  public renderData: RenderDataInterface

  constructor(
    app: App,
    el: HTMLElement = null,
    parentRenderNode: RenderNode = null
  ) {
    super(app);

    this.el = el;
    this.parentRenderNode = parentRenderNode;
  }

  public init(renderData: RenderDataInterface) {
    this.loadRenderData(renderData);
  }

  loadRenderData(renderData: RenderDataInterface) {
    this.renderData = renderData;

    if (this.parentRenderNode) {
      this.parentRenderNode.appendChildRenderNode(this);
    }
  }

  appendChildRenderNode(renderNode: RenderNode) {
    this.childRenderNodes[renderNode.getId()] = renderNode;
  }

  forEachChildRenderNode(callback?: Function) {
    Object.values(this.childRenderNodes).forEach((renderNode) => callback(renderNode));
  }

  public focus() {
    this.focused = true;
    this.activateListeners();
  }

  public blur() {
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
