import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import AppChild from './AppChild';
import App from './App';
import Component from './Component';

export default abstract class RenderNode extends AppChild {
  public childRenderNodes: { [key: string]: RenderNode } = {};
  public components: Component[] = [];
  public el: HTMLElement;
  public focused: boolean = false;
  public id: string;
  public name: string;
  public parentRenderNode: RenderNode;
  public renderData: RenderDataInterface;
  public translations: {} = {};
  public vars: any = {};

  constructor(app: App, el: HTMLElement = null) {
    super(app);

    this.el = el;

    this.app.mix(this, 'renderNode');
  }

  public async init() {
    await this.readyComplete();
  }

  public exit() {
    this.forEachChildRenderNode((renderNode: RenderNode) => {
      renderNode.exit();
    });

    if (this.parentRenderNode) {
      this.parentRenderNode.removeChildRenderNode(this);
    }
  }

  loadRenderData(renderData: RenderDataInterface) {
    this.renderData = renderData;

    // Attach to caller node, or current active page, or null.
    let parentNode =
      (renderData.requestOptions &&
        renderData.requestOptions.callerRenderNode) ||
      (this.app.layout && this.app.layout.pageFocused);
    if (parentNode) {
      parentNode.appendChildRenderNode(this);
    }

    this.mergeRenderData(renderData);
  }

  mergeRenderData(renderData: RenderDataInterface) {
    this.id = renderData.id;
    this.name = renderData.name;

    this.translations = {
      ...this.translations,
      ...renderData.translations,
    };

    this.vars = { ...this.vars, ...renderData.vars };
  }

  appendChildRenderNode(renderNode: RenderNode) {
    renderNode.parentRenderNode = this;
    this.childRenderNodes[renderNode.id] = renderNode;
  }

  removeChildRenderNode(renderNode: RenderNode) {
    delete this.childRenderNodes[renderNode.id];
  }

  forEachChildRenderNode(callback?: Function) {
    Object.values(this.childRenderNodes).forEach((renderNode) =>
      callback(renderNode)
    );
  }

  forEachRenderNode(callback?: Function) {
    callback(this);

    this.forEachChildRenderNode(callback);
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

  public abstract getRenderNodeType(): string;
}
