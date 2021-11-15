import App from './App';
import PageResponsiveDisplay from './PageResponsiveDisplay';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import AppChild from './AppChild';
import MixinInterface from '../interfaces/MixinInterface';
import { ServiceRegistryPageInterface } from '../interfaces/ServiceRegistryPageInterface';

export default class extends AppChild {
  public readonly el: HTMLElement;
  public readonly elOverlay: HTMLElement;
  public readonly isLayoutPage: boolean;
  public readonly name: string;
  protected readonly onChangeResponsiveSizeProxy: Function;
  protected readonly onChangeThemeProxy: Function;
  protected readonly responsiveDisplays: any = [];
  public renderData: RenderDataPageInterface;
  public responsiveDisplayCurrent: PageResponsiveDisplay;
  public vars: any;
  public services: ServiceRegistryPageInterface;

  constructor(app: App, renderData: RenderDataPageInterface) {
    super(app);

    this.isLayoutPage = renderData.isLayoutPage;
    this.name = renderData.name;
    this.onChangeResponsiveSizeProxy = this.onChangeResponsiveSize.bind(this);
    this.onChangeThemeProxy = this.onChangeTheme.bind(this);

    if (this.isLayoutPage) {
      this.app.layoutPage = this;
      this.el = this.app.elLayout;
    } else {
      this.el = renderData.el;
    }

    // A component may have been define as page container (modal / panel).
    let pageHandler =
      this.services.components.pageHandlerRegistry[renderData.renderRequestId];
    if (pageHandler) {
      this.el = pageHandler.renderPageEl(renderData, this);
    }

    if (!this.el) {
      let promptService = this.services.prompts;

      promptService.systemError('page_message.error.page_missing_el');
      return;
    }

    this.elOverlay = this.el.querySelector('.page-overlay');

    this.app.loadMixins(this.getPageLevelMixins());
  }

  getPageLevelMixins(): MixinInterface[] {
    return [];
  }

  init(pageRenderData: RenderDataPageInterface) {
    // To override...
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
    this.loadPageRenderData(renderData, () => {
      this.services.events.listen(
        'responsive-change-size',
        this.onChangeResponsiveSizeProxy
      );

      this.services.events.listen('theme-change', this.onChangeThemeProxy);

      this.updateCurrentResponsiveDisplay();

      this.updateLayoutTheme(this.services.theme.activeTheme);

      this.init(renderData);

      complete && complete(this);
    });
  }

  loadPageRenderData(renderData: RenderDataPageInterface, complete?: Function) {
    this.vars = { ...this.vars, ...renderData.vars };
    this.renderData = renderData;

    this.services.mixins.invokeUntilComplete(
      'loadPageRenderData',
      'page',
      [this],
      complete
    );
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
