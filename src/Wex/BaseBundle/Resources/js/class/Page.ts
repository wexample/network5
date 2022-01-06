import PageResponsiveDisplay from './PageResponsiveDisplay';
import RenderDataPageInterface from '../interfaces/RenderData/PageInterface';
import RenderNode from './RenderNode';
import PageManagerComponent from './PageManagerComponent';
import AppService from './AppService';
import { ColorSchemeServiceEvents } from '../services/ColorSchemeService';
import { ResponsiveServiceEvents } from '../services/ResponsiveService';
import Layout from './Layout';
import AppInterface from '../interfaces/ServicesRegistryInterface';

export default class extends RenderNode {
  public elOverlay: HTMLElement;
  public isInitialPage: boolean;
  public name: string;
  protected onChangeResponsiveSizeProxy: Function;
  protected onChangeColorSchemeProxy: Function;
  public parentRenderNode: Layout | PageManagerComponent;
  protected readonly responsiveDisplays: any = [];
  public renderData: RenderDataPageInterface;
  public responsiveDisplayCurrent: PageResponsiveDisplay;
  public services: AppInterface;

  public getRenderNodeType(): string {
    return 'page';
  }

  getPageLevelMixins(): typeof AppService[] {
    return [];
  }

  attachHtmlElements() {
    let el: HTMLElement;

    if (this.renderData.isInitialPage) {
      el = this.app.layout.el;
    } else if (this.parentRenderNode instanceof PageManagerComponent) {
      el = this.parentRenderNode.renderPageEl(this);
    }

    if (el) {
      this.el = el;
    } else {
      this.services.prompt.systemError('page_message.error.page_missing_el');
    }

    this.elOverlay = this.el.querySelector('.page-overlay');
  }

  loadRenderData(renderData: RenderDataPageInterface) {
    super.loadRenderData(renderData);

    if (this.isInitialPage) {
      this.app.layout.page = this;
    }
  }

  mergeRenderData(renderData: RenderDataPageInterface) {
    super.mergeRenderData(renderData);

    this.isInitialPage = renderData.isInitialPage;
    this.name = renderData.name;
  }

  public async init() {
    await super.init();

    await this.app.loadAndInitServices(this.getPageLevelMixins());

    await this.services.mixins.invokeUntilComplete(
      'hookInitPage',
      'page',
      [this]
    );

    if (this.parentRenderNode instanceof PageManagerComponent) {
      this.parentRenderNode.setPage(this);
    }

    this.updateCurrentResponsiveDisplay();

    this.updateLayoutColorScheme(this.services.colorScheme.activeColorScheme);
  }

  public async mounted() {
    this.focus();
  }

  public focus() {
    super.focus();

    this.activateFocusListeners();

    this.app.layout.pageFocused && this.app.layout.pageFocused.blur();
    this.app.layout.pageFocused = this;
  }

  public blur() {
    super.blur();

    this.deactivateFocusListeners();
  }

  protected activateFocusListeners(): void {
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

  protected deactivateFocusListeners(): void {
    this.services.events.forget(
      ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
      this.onChangeResponsiveSizeProxy
    );

    this.services.events.forget(
      ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE,
      this.onChangeResponsiveSizeProxy
    );
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
