import ComponentInterface from '../interfaces/RenderData/ComponentInterface';
import Component from './Component';
import Page from './Page';

export default abstract class PageManagerComponent extends Component {
  public page: Page;

  loadRenderData(renderData: ComponentInterface) {
    super.loadRenderData(renderData);

    // This component is defined as the manager of
    // rendered page from the request.
    // Basically a modal or a panel (layout level).
    if (renderData.options.adaptiveResponseBodyDestination) {
      // Save component in registry for further usage.
      this.services.components.pageHandlerRegistry[renderData.renderRequestId] =
        this;
    }
  }

  /**
   * Used by page handlers (modal / panels).
   */
  public abstract renderPageEl(page: Page): HTMLElement;

  public abstract getPageEl(): HTMLElement;

  public setPage(page: Page) {
    this.page = page;
  }
}
