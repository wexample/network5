import PageResponsiveDisplay from './PageResponsiveDisplay';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import MixinInterface from '../interfaces/MixinInterface';
import { ServiceRegistryPageInterface } from '../interfaces/ServiceRegistryPageInterface';
import RenderNode from './RenderNode';
import PageHandlerComponent from './PageHandlerComponent';
import RenderDataInterface from "../interfaces/RenderDataInterface";

export default class extends RenderNode {
  public elOverlay: HTMLElement;
  public isLayoutPage: boolean;
  public name: string;
  protected onChangeResponsiveSizeProxy: Function;
  protected onChangeThemeProxy: Function;
  public parentRenderNode: PageHandlerComponent;
  protected readonly responsiveDisplays: any = [];
  public renderData: RenderDataPageInterface;
  public responsiveDisplayCurrent: PageResponsiveDisplay;
  public vars: any;
  public services: ServiceRegistryPageInterface;

  public getId(): string {
    return 'page-' + this.name;
  }

  public getRenderNodeType(): string {
    return 'page';
  }

  getPageLevelMixins(): MixinInterface[] {
    return [];
  }

  exit() {
    // To override...
  }

  destroy() {
    this.deactivateListeners();
    this.exit();
  }

  loadRenderData(renderData: RenderDataInterface) {
    super.loadRenderData(renderData);

    this.isLayoutPage = this.renderData.isLayoutPage;
    this.name = this.renderData.name;

    if (this.isLayoutPage) {
      this.app.layout.page = this;
    }

    this.elOverlay = this.el.querySelector('.page-overlay');

    this.vars = {...this.vars, ...this.renderData.vars};
  }

  init(complete?: Function) {
    this.ready(complete);

    this.app.loadAndInitMixins(this.getPageLevelMixins(), () => {
      this.services.mixins.invokeUntilComplete(
        'loadPageRenderData',
        'page',
        [this],
        () => {
          this.updateCurrentResponsiveDisplay();

          this.updateLayoutTheme(this.services.theme.activeTheme);

          this.activateListeners();

          this.focus();

          this.mounted();

          this.readyComplete(this);
        }
      );
    });
  }

  public focus() {
    super.focus();

    this.app.layout.pageFocused
    && this.app.layout.pageFocused.blur();
  }

  protected activateListeners(): void {
    super.activateListeners();

    this.onChangeResponsiveSizeProxy = this.onChangeResponsiveSize.bind(this);
    this.onChangeThemeProxy = this.onChangeTheme.bind(this);

    this.services.events.listen(
      'responsive-change-size',
      this.onChangeResponsiveSizeProxy
    );

    this.services.events.listen('theme-change', this.onChangeThemeProxy);
  }

  protected deactivateListeners(): void {
    super.deactivateListeners();

    this.services.events.forget(
      'responsive-change-size',
      this.onChangeResponsiveSizeProxy
    );

    this.services.events.forget(
      'theme-change',
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
