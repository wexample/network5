import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import AppChild from './AppChild';
import App from './App';
import Component from './Component';
import Page from "./Page";
import { ComponentsServiceEvents } from "../services/RenderNodeService";

export default abstract class RenderNode extends AppChild {
  public callerPage: Page;
  public childRenderNodes: { [key: string]: RenderNode } = {};
  public components: Component[] = [];
  public el: HTMLElement;
  public elements: { [key: string]: HTMLElement } = {};
  public focused: boolean = false;
  public id: string;
  public isMounted: boolean = false;
  public name: string;
  public parentRenderNode: RenderNode;
  public renderData: RenderDataInterface;
  public translations: {} = {};
  public vars: any = {};
  // Mixed functions from services.
  public trans?: Function;

  constructor(app: App, parentRenderNode?: RenderNode) {
    super(app);

    this.parentRenderNode = parentRenderNode;

    this.app.mix(this, 'renderNode');

    this.services.events.trigger(ComponentsServiceEvents.CREATE_RENDER_NODE, {
      component: this,
    });
  }

  public async init() {
    // Layout can have no parent node.
    if (this.parentRenderNode) {
      this.parentRenderNode.appendChildRenderNode(this);
    }
  }

  public async exit() {
    for (const renderNode of this.eachChildRenderNode()) {
      await renderNode.exit();
    }

    if (this.parentRenderNode) {
      this.parentRenderNode.removeChildRenderNode(this);
    }

    await this.unmounted();
  }

  loadRenderData(renderData: RenderDataInterface) {
    this.renderData = renderData;

    this.mergeRenderData(renderData);
  }

  mergeRenderData(renderData: RenderDataInterface) {
    this.id = renderData.id;
    this.name = renderData.name;

    this.translations = {
      ...this.translations,
      ...renderData.translations,
    };

    this.vars = {...this.vars, ...renderData.vars};
  }

  appendChildRenderNode(renderNode: RenderNode) {
    renderNode.parentRenderNode = this;
    this.childRenderNodes[renderNode.id] = renderNode;
  }

  removeChildRenderNode(renderNode: RenderNode) {
    delete this.childRenderNodes[renderNode.id];
  }

  findChildRenderNodeByName(name: string): RenderNode {
    for (let node of this.eachChildRenderNode()) {
      if (node.name === name) {
        return node;
      }
    }

    return null;
  }

  eachChildRenderNode(): RenderNode[] {
    return Object.values(this.childRenderNodes);
  }

  abstract attachHtmlElements();

  async mount() {
    if (this.isMounted) {
      return
    }

    this.isMounted = true;

    this.attachHtmlElements();
    this.activateListeners();
    await this.mounted();
    await this.readyComplete();
  }

  async unmount() {
    if (!this.isMounted) {
      return
    }

    this.isMounted = false;

    this.detachHtmlElements();
    this.deactivateListeners();
    await this.unmounted();
  }

  async mountTree() {
    this.forEachTreeRenderNode((renderNode: RenderNode) => {
      renderNode.mount();
    });
  }

  detachHtmlElements() {
    this.el.remove();
    delete this.el;

    let el: HTMLElement;
    for (el of Object.values(this.elements)) {
      el.remove();
    }

    this.elements = {};
  }

  public async updateMounting() {
    if (this.el && !this.el.isConnected) {
      await this.unmount();
    } else if (!this.el) {
      await this.mount();
    }
  }

  forEachTreeRenderNode(callback?: Function) {
    let renderNode: RenderNode;


    callback(this);

    for (renderNode of this.eachChildRenderNode()) {
      renderNode.forEachTreeRenderNode(
        callback
      );
    }
  }

  public focus() {
    this.focused = true;
  }

  public blur() {
    this.focused = false;
  }

  protected activateListeners(): void {
    // To override...
  }

  protected deactivateListeners(): void {
    // To override...
  }

  protected async mounted(): Promise<void> {
    // To override...
  }

  protected async unmounted(): Promise<void> {
    // To override...
  }

  public abstract getRenderNodeType(): string;
}
