import App from './App';
import PageResponsiveDisplay from './PageResponsiveDisplay';
import PageRenderDataInterface from '../interfaces/PageRenderDataInterface';
import AppChild from './AppChild';

export default class extends AppChild {
  public readonly el: HTMLElement;
  public readonly isLayoutPage: boolean;
  public readonly name: string;
  protected readonly onChangeResponsiveSizeProxy: Function;
  protected readonly onChangeThemeProxy: Function;
  protected readonly responsiveDisplays: any = [];
  public renderData: PageRenderDataInterface;
  public responsiveDisplayCurrent: PageResponsiveDisplay;
  public vars: any;

  constructor(app: App, renderData: PageRenderDataInterface) {
    super(app);

    // Set readonly variables.
    this.isLayoutPage = renderData.isLayoutPage;
    this.name = renderData.name;
    this.onChangeResponsiveSizeProxy = this.onChangeResponsiveSize.bind(this);
    this.onChangeThemeProxy = this.onChangeTheme.bind(this);

    if (this.isLayoutPage) {
      this.app.layoutPage = this;
      this.el = this.app.elLayout;
    }
  }

  init(pageRenderData: PageRenderDataInterface) {
    // To override...
  }

  exit() {
    // To override...
  }

  destroy() {
    let eventsService = this.app.getService('events');

    eventsService.forget(
      'responsive-change-size',
      this.onChangeResponsiveSizeProxy
    );

    eventsService.forget('theme-change', this.onChangeResponsiveSizeProxy);

    this.exit();
  }

  loadInitialRenderData(
    renderData: PageRenderDataInterface,
    complete?: Function
  ) {
    this.loadRenderData(renderData, () => {
      let eventsService = this.app.getService('events');

      eventsService.listen(
        'responsive-change-size',
        this.onChangeResponsiveSizeProxy
      );

      eventsService.listen('theme-change', this.onChangeThemeProxy);

      this.updateCurrentResponsiveDisplay();

      let themeService = this.app.getService('theme');
      this.updateLayoutTheme(themeService.activeTheme);

      this.init(renderData);

      complete && complete(this);
    });
  }

  loadRenderData(renderData: PageRenderDataInterface, complete?: Function) {
    this.vars = { ...this.vars, ...renderData.vars };
    this.renderData = renderData;

    this.app
      .getService('mixins')
      .invokeUntilComplete('loadPageRenderData', 'page', [this], complete);
  }

  updateCurrentResponsiveDisplay() {
    let responsiveMixin = this.app.getService('responsive');
    let previous = responsiveMixin.responsiveSizePrevious;
    let current = responsiveMixin.responsiveSizeCurrent;
    let displays = this.responsiveDisplays;

    if (previous !== current) {
      if (displays[current] === undefined) {
        let display = this.app.getBundleClassDefinition(
          'page',
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
        displays[current].onReonChangeThemesponsiveEnter();
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
}
