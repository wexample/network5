import App from './App';
import PageResponsiveDisplay from './PageResponsiveDisplay';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import MixinInterface from '../interfaces/MixinInterface';
import { ServiceRegistryPageInterface } from '../interfaces/ServiceRegistryPageInterface';
import RenderNode from "./RenderNode";

export default class extends RenderNode {
  public el: HTMLElement;
  public elOverlay: HTMLElement;
  public isLayoutPage: boolean;
  public name: string;
  protected readonly onChangeResponsiveSizeProxy: Function;
  protected readonly onChangeThemeProxy: Function;
  protected readonly responsiveDisplays: any = [];
  public renderData: RenderDataPageInterface;
  public responsiveDisplayCurrent: PageResponsiveDisplay;
  public vars: any;
  public services: ServiceRegistryPageInterface;

  constructor(app: App) {
    super(app);
    this.onChangeResponsiveSizeProxy = this.onChangeResponsiveSize.bind(this);
    this.onChangeThemeProxy = this.onChangeTheme.bind(this);
  }

  public getId(): string {
    return 'page-' + this.name;
  }

  public getRenderNodeType(): string {
    return 'page';
  }

  init(renderData: RenderDataPageInterface) {
    super.init(renderData);

    this.isLayoutPage = renderData.isLayoutPage;
    this.name = renderData.name;

    if (this.isLayoutPage) {
      this.app.layout.page = this;
      this.el = this.app.elLayout;
    } else {
      this.el = renderData.el;
    }

    // A component may have been defined as page handler (modal / panel).
    let pageHandlerRegistry = this.services.components.pageHandlerRegistry;
    let pageHandler = pageHandlerRegistry[renderData.renderRequestId];
    if (pageHandler) {
      pageHandler.renderPageEl(this, renderData);
      this.parentRenderNode = pageHandler;
      this.el = pageHandler.getPageEl();
    }

    if (!this.el) {
      let promptService = this.services.prompts;

      promptService.systemError('page_message.error.page_missing_el');
      return;
    }

    this.elOverlay = this.el.querySelector('.page-overlay');

    if (pageHandler) {
      pageHandler.initPage(this, renderData);
      delete pageHandlerRegistry[renderData.renderRequestId];
    }

    this.app.loadMixins(this.getPageLevelMixins());
  }

  getPageLevelMixins(): MixinInterface[] {
    return [];
  }

  exit() {
    // To override...
  }

  destroy() {
    let eventsService = this.services.events;

    eventsService.forget(
      'responsive-change-size',
      this.onChangeResponsiveSizeProxy
    );

    eventsService.forget('theme-change', this.onChangeResponsiveSizeProxy);

    this.exit();
  }

  loadInitialRenderData(
    renderData: RenderDataPageInterface,
    complete?: Function
  ) {
    this.init(renderData);

    this.loadPageRenderData(() => {
      this.services.events.listen(
        'responsive-change-size',
        this.onChangeResponsiveSizeProxy
      );

      this.services.events.listen(
        'theme-change',
        this.onChangeThemeProxy
      );

      this.updateCurrentResponsiveDisplay();

      this.updateLayoutTheme(this.services.theme.activeTheme);

      this.ready();

      complete && complete(this);
    });
  }

  loadPageRenderData(complete?: Function) {
    this.vars = {...this.vars, ...this.renderData.vars};

    this.services.mixins.invokeUntilComplete(
      'loadPageRenderData',
      'page',
      [this],
      complete
    );
  }

  ready() {
    // To override with local page scripts.
  }

  updateCurrentResponsiveDisplay() {
    let previous = this.services.responsive.responsiveSizePrevious;
    let current = this.services.responsive.responsiveSizeCurrent;
    let displays = this.responsiveDisplays;

    if (previous !== current) {
      if (displays[current] === undefined) {
        let display = this.app.getBundleClassDefinition(
          `${this.name}-${current}`
        );

        displays[current] = display ? new display(this) : null;

        if (displays[current]) {
          displays[current].init();
        }
      }

      if (displays[previous]) {
        displays[previous].onResponsiveExit();
      }

      if (displays[current]) {
        displays[current].onResponsiveEnter();
      }

      this.responsiveDisplayCurrent = displays[current];
    }
  }

  onChangeResponsiveSize() {
    this.updateCurrentResponsiveDisplay();
  }

  onChangeTheme(event) {
    this.updateLayoutTheme(event.theme);
  }

  updateLayoutTheme(theme: string) {
    // To override.
  }

  loadingStart() {
    this.elOverlay.style.display = 'block';
  }

  loadingStop() {
    this.elOverlay.style.display = 'none';
  }
}
