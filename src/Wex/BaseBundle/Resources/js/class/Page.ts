import PageResponsiveDisplay from './PageResponsiveDisplay';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import { ServiceRegistryPageInterface } from '../interfaces/ServiceRegistryPageInterface';
import RenderNode from './RenderNode';
import PageHandlerComponent from './PageHandlerComponent';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';
import RequestOptionsPageInterface from '../interfaces/RequestOptionsPageInterface';
import AppService from './AppService';
import { ThemeServiceEvents } from '../services/Theme';
import { ResponsiveServiceEvents } from '../services/Responsive';

export default class extends RenderNode {
  public elOverlay: HTMLElement;
  public isInitialPage: boolean;
  public name: string;
  protected onChangeResponsiveSizeProxy: Function;
  protected onChangeThemeProxy: Function;
  public parentRenderNode: PageHandlerComponent;
  protected readonly responsiveDisplays: any = [];
  public renderData: RenderDataPageInterface;
  public requestOptions: RequestOptionsPageInterface;
  public responsiveDisplayCurrent: PageResponsiveDisplay;
  public services: ServiceRegistryPageInterface;

  public getId(): string {
    return 'page-' + this.name;
  }

  public getRenderNodeType(): string {
    return 'page';
  }

  getPageLevelMixins(): typeof AppService[] {
    return [];
  }

  loadRenderData(
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface
  ) {
    super.loadRenderData(renderData, requestOptions);

    this.isInitialPage = this.renderData.isInitialPage;
    this.name = this.renderData.name;
    this.requestOptions = requestOptions;

    if (this.isInitialPage) {
      this.app.layout.page = this;
    }

    this.elOverlay = this.el.querySelector('.page-overlay');
  }

  async init() {
    await this.app.loadAndInitServices(
      this.getPageLevelMixins()
    );

    await this.services.mixins
      .invokeUntilComplete(
        'loadPageRenderData',
        'page',
        [this]
      );

    if (this.renderData.pageHandler) {
      this.renderData.pageHandler.setPage(this);
    }

    this.updateCurrentResponsiveDisplay();

    this.updateLayoutTheme(this.services.theme.activeTheme);

    this.activateListeners();

    this.focus();

    this.mounted();

    await this.readyComplete(this);
  }

  public focus() {
    super.focus();

    this.app.layout.pageFocused && this.app.layout.pageFocused.blur();
    this.app.layout.pageFocused = this;
  }

  protected activateListeners(): void {
    super.activateListeners();

    this.onChangeResponsiveSizeProxy = this.onChangeResponsiveSize.bind(this);
    this.onChangeThemeProxy = this.onChangeTheme.bind(this);

    this.services.events.listen(
      'responsive-change-size',
      this.onChangeResponsiveSizeProxy
    );

    this.services.events.listen(
      ThemeServiceEvents.THEME_CHANGE,
      this.onChangeThemeProxy
    );
  }

  protected deactivateListeners(): void {
    super.deactivateListeners();

    this.services.events.forget(
      ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
      this.onChangeResponsiveSizeProxy
    );

    this.services.events.forget(
      ThemeServiceEvents.THEME_CHANGE,
      this.onChangeResponsiveSizeProxy
    );
  }

  mounted() {
    // To override with local page scripts.
  }

  updateCurrentResponsiveDisplay() {
    let previous = this.services.responsive.responsiveSizePrevious;
    let current = this.services.responsive.responsiveSizeCurrent;
    let displays = this.responsiveDisplays;

    if (previous !== current) {
      if (displays[current] === undefined) {
        let display = this.app.getBundleClassDefinition(
          `${this.name}-${current}`,
          true
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
