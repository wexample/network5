import RenderDataInterface from '../interfaces/RenderDataInterface';
import AppChild from './AppChild';
import App from './App';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export default abstract class RenderNode extends AppChild {
  public childRenderNodes: { [key: string]: RenderNode } = {};
  public el: HTMLElement;
  public focused: boolean = false;
  public id: string;
  public parentRenderNode: RenderNode;
  public renderData: RenderDataInterface;

  constructor(app: App, el: HTMLElement = null) {
    super(app);

    this.el = el;
  }

  public init(complete?: Function) {
    this.ready(complete);
    this.readyComplete(this);
  }

  public exit() {
    this.forEachChildRenderNode((renderNode: RenderNode) => {
      renderNode.exit();
    });

    if (this.parentRenderNode) {
      this.parentRenderNode.removeChildRenderNode(this);
    }
  }

  loadRenderData(
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface
  ) {
    this.renderData = renderData;

    if (requestOptions.parentRenderNode) {
      requestOptions.parentRenderNode.appendChildRenderNode(this);
    }
  }

  appendChildRenderNode(renderNode: RenderNode) {
    renderNode.parentRenderNode = this;
    this.childRenderNodes[renderNode.getId()] = renderNode;
  }

  removeChildRenderNode(renderNode: RenderNode) {
    delete this.childRenderNodes[renderNode.getId()];
  }

  forEachChildRenderNode(callback?: Function) {
    Object.values(this.childRenderNodes).forEach((renderNode) =>
      callback(renderNode)
    );
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
