import PageResponsiveDisplay from './PageResponsiveDisplay';
import RenderDataPageInterface from '../interfaces/RenderData/PageInterface';
import RenderNode from './RenderNode';
import PageManagerComponent from './PageManagerComponent';
import AppService from './AppService';
import { ColorSchemeServiceEvents } from '../services/ColorSchemeService';
import { ResponsiveServiceEvents } from '../services/ResponsiveService';
import AppInterface from '../interfaces/ServicesRegistryInterface';
import { pathToTagName } from "../helpers/String";

export default class extends RenderNode {
  public elOverlay: HTMLElement;
  public isInitialPage: boolean;
  public name: string;
  protected onChangeResponsiveSizeProxy: Function;
  protected onChangeColorSchemeProxy: Function;
  public parentRenderNode: PageManagerComponent;
  protected readonly responsiveDisplays: any = [];
  public renderData: RenderDataPageInterface;
  public responsiveEnabled: boolean = true;
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

    this.el.classList.add(`page-${pathToTagName(this.name)}`);

    this.elOverlay = this.el.querySelector('.page-overlay');
  }

  mergeRenderData(renderData: RenderDataPageInterface) {
    super.mergeRenderData(renderData);

    this.isInitialPage = renderData.isInitialPage;
    this.name = renderData.name;

    if (this.isInitialPage) {
      this.app.layout.page = this;
    }
  }

  public async init() {
    await super.init();

    await this.app.loadAndInitServices(this.getPageLevelMixins());

    // The initial layout is not a page manager component.
    if (this.parentRenderNode instanceof PageManagerComponent) {
      this.parentRenderNode.setPage(this);
    }

    await this.services.mixins.invokeUntilComplete('hookInitPage', 'page', [
      this,
    ]);

    await this.updateLayoutColorScheme(this.activeColorScheme);
  }

  public async mounted() {
    this.activateMountedListeners();

    await super.mounted();

    this.focus();
  }

  public async unmounted() {
    this.deactivateMountedListeners();

    await super.unmounted();

    this.focus();
  }

  public async renderNodeReady(): Promise<void> {
    await super.renderNodeReady();

    await this.pageReady();
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
    // To override.
  }

  protected deactivateFocusListeners(): void {
    // To override.
  }

  protected activateMountedListeners(): void {
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

  protected deactivateMountedListeners(): void {
    this.services.events.forget(
      ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
      this.onChangeResponsiveSizeProxy
    );

    this.services.events.forget(
      ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE,
      this.onChangeResponsiveSizeProxy
    );
  }

  async updateCurrentResponsiveDisplay() {
    let previous = this.responsiveSizePrevious;
    let current = this.responsiveSizeCurrent;
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
        await displays[previous].onResponsiveExit();
      }

      if (displays[current]) {
        await displays[current].onResponsiveEnter();
      }

      this.responsiveDisplayCurrent = displays[current];
    }
  }

  getElWidth(): number {
    // Initial page uses layout width for responsiveness calculation.
    return this.isInitialPage
      ? this.app.layout.getElWidth()
      : super.getElWidth();
  }

  async onChangeResponsiveSize(event) {
    if (event.detail.renderNode === this) {
      await this.updateCurrentResponsiveDisplay();
    }
  }

  async onChangeColorScheme(event) {
    if (event.detail.renderNode === this) {
      await this.updateLayoutColorScheme(event.theme);
    }
  }

  async updateLayoutColorScheme(theme: string) {
    // To override.
  }

  loadingStart() {
    this.elOverlay.style.display = 'block';
  }

  loadingStop() {
    this.elOverlay.style.display = 'none';
  }

  pageReady() {
    // To override.
  }
}
