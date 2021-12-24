import PageResponsiveDisplay from './PageResponsiveDisplay';
import RenderDataPageInterface from '../interfaces/RenderData/PageInterface';
import { PageInterface as ServiceRegistryPageInterface } from '../interfaces/ServiceRegistry/PageInterface';
import RenderNode from './RenderNode';
import PageHandlerComponent from './PageHandlerComponent';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';
import RequestOptionsPageInterface from '../interfaces/RequestOptions/PageInterface';
import AppService from './AppService';
import { ColorSchemeServiceEvents } from '../services/ColorSchemeService';
import { ResponsiveServiceEvents } from '../services/ResponsiveService';

export default class extends RenderNode {
  public elOverlay: HTMLElement;
  public isInitialPage: boolean;
  public name: string;
  protected onChangeResponsiveSizeProxy: Function;
  protected onChangeColorSchemeProxy: Function;
  public parentRenderNode: PageHandlerComponent;
  protected readonly responsiveDisplays: any = [];
  public renderData: RenderDataPageInterface;
  public requestOptions: RequestOptionsPageInterface;
  public responsiveDisplayCurrent: PageResponsiveDisplay;
  public services: ServiceRegistryPageInterface;

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
    await this.app.loadAndInitServices(this.getPageLevelMixins());

    await this.services.mixins.invokeUntilComplete(
      'loadPageRenderData',
      'page',
      [this]
    );

    if (this.renderData.pageHandler) {
      this.renderData.pageHandler.setPage(this);
    }

    this.updateCurrentResponsiveDisplay();

    this.updateLayoutColorScheme(this.services.colorScheme.activeColorScheme);

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
    this.onChangeColorSchemeProxy = this.onChangeColorScheme.bind(this);

    this.services.events.listen(
      ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
      this.onChangeResponsiveSizeProxy
    );

    this.services.events.listen(
      ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE,
      this.onChangeColorSchemeProxy
    );
  }

  protected deactivateListeners(): void {
    super.deactivateListeners();

    this.services.events.forget(
      ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
      this.onChangeResponsiveSizeProxy
    );

    this.services.events.forget(
      ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE,
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

  onChangeColorScheme(event) {
    this.updateLayoutColorScheme(event.theme);
  }

  updateLayoutColorScheme(theme: string) {
    // To override.
  }

  loadingStart() {
    this.elOverlay.style.display = 'block';
  }

  loadingStop() {
    this.elOverlay.style.display = 'none';
  }
}
