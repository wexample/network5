import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import AppChild from './AppChild';
import App from './App';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';
import Component from './Component';
import TranslationsInterface from '../interfaces/TranslationsInterface';

export default abstract class RenderNode extends AppChild {
  public childRenderNodes: { [key: string]: RenderNode } = {};
  public components: Component[] = [];
  public el: HTMLElement;
  public focused: boolean = false;
  public id: string;
  public parentRenderNode: RenderNode;
  public renderData: RenderDataInterface;
  public translations: TranslationsInterface = {
    domain: null,
    catalog: {},
  };
  public vars: any = {};

  constructor(app: App, el: HTMLElement = null) {
    super(app);

    this.el = el;
  }

  public async init() {
    await this.readyComplete(this);
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

    // Attach to caller not, or current active page, or null.
    let parentNode = (requestOptions.callerRenderNode || (this.app.layout && this.app.layout.pageFocused))
    if (parentNode) {
      parentNode.appendChildRenderNode(this);
    }

    this.translations.catalog = {
      ...this.translations.catalog,
      ...this.renderData.translations.catalog,
    };
    this.vars = { ...this.vars, ...this.renderData.vars };
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

  public abstract getId(): string;

  public abstract getRenderNodeType(): string;
}
