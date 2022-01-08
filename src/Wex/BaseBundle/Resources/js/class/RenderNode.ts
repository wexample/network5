import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import AppChild from './AppChild';
import App from './App';
import Component from './Component';
import Page from './Page';
import { ComponentsServiceEvents } from '../services/AbstractRenderNodeService';

export default abstract class RenderNode extends AppChild {
  public callerPage: Page;
  public childRenderNodes: { [key: string]: RenderNode } = {};
  public components: Component[] = [];
  public el: HTMLElement;
  public elements: { [key: string]: HTMLElement } = {};
  public elHeight: number = 0;
  public elWidth: number = 0;
  public focused: boolean = false;
  public id: string;
  public isMounted: boolean = false;
  public name: string;
  public parentRenderNode: RenderNode;
  public renderData: RenderDataInterface;
  public responsiveEnabled: boolean = false;
  public translations: {} = {};
  public vars: any = {};
  // Mixed functions from services.
  public assetsUpdate?: Function;
  public activeColorScheme?: string;
  public colorSchemeSet?: Function;
  public colorSchemeUpdate?: Function;
  public colorSchemeForced?: boolean;
  public trans?: Function;
  public responsiveBreakpointIsSupported?: Function;
  public responsiveDetect?: Function;
  public responsiveSet?: Function;
  public responsiveSizeCurrent?: string;
  public responsiveSizePrevious?: string;
  public responsiveUpdate?: Function;
  public responsiveUpdateTree?: Function;
  public colorSchemeActivePrint: boolean = false;

  constructor(app: App, parentRenderNode?: RenderNode) {
    super(app);

    this.parentRenderNode = parentRenderNode;
  }

  public async init() {
    this.app.mix(this, 'renderNode');

    this.services.events.trigger(ComponentsServiceEvents.CREATE_RENDER_NODE, {
      component: this,
    });

    // Layout can have no parent node.
    if (this.parentRenderNode) {
      this.parentRenderNode.appendChildRenderNode(this);
    }

    await this.services.mixins.invokeUntilComplete(
      'hookInitRenderNode',
      'renderNode',
      [this]
    );
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

    this.vars = { ...this.vars, ...renderData.vars };
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
      return;
    }

    this.isMounted = true;

    this.attachHtmlElements();
    this.updateElSize();

    await this.activateListeners();
    await this.mounted();
    await this.readyComplete();
  }

  async unmount() {
    if (!this.isMounted) {
      return;
    }

    this.isMounted = false;

    this.detachHtmlElements();

    await this.deactivateListeners();
    await this.unmounted();
  }

  async mountTree() {
    await this.forEachTreeRenderNode(async (renderNode: RenderNode) => {
      await renderNode.mount();
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

  async forEachTreeRenderNode(callback?: Function) {
    await callback(this);

    await this.forEachTreeChildRenderNode(callback);
  }

  async forEachTreeChildRenderNode(callback?: Function) {
    let renderNode: RenderNode;
    for (renderNode of this.eachChildRenderNode()) {
      await renderNode.forEachTreeRenderNode(callback);
    }
  }

  updateElSize() {
    let rect = this.el.getBoundingClientRect();

    this.elWidth = rect.width;
    this.elHeight = rect.height;
  }

  getElWidth(): number {
    return this.elWidth;
  }

  getElHeight(): number {
    return this.elHeight;
  }

  public focus() {
    this.focused = true;
  }

  public blur() {
    this.focused = false;
  }

  protected async activateListeners(): Promise<void> {
    await this.services.mixins.invokeUntilComplete(
      'hookActivateListener',
      'renderNode',
      [this]
    );
  }

  protected async deactivateListeners(): Promise<void> {
    await this.services.mixins.invokeUntilComplete(
      'hookDeactivateListener',
      'renderNode',
      [this]
    );
  }

  protected async mounted(): Promise<void> {
    if (this.parentRenderNode) {
      this.parentRenderNode.childMounted(this);
    }

    await this.services.mixins.invokeUntilComplete(
      'hookMounted',
      'renderNode',
      [this]
    );
  }

  protected async unmounted(): Promise<void> {
    if (this.parentRenderNode) {
      this.parentRenderNode.childUnmounted(this);
    }

    await this.services.mixins.invokeUntilComplete(
      'hookUnmounted',
      'renderNode',
      [this]
    );
  }

  protected childMounted(renderNode: RenderNode) {
    // To override.
  }

  protected childUnmounted(renderNode: RenderNode) {
    // To override.
  }

  public abstract getRenderNodeType(): string;
}
