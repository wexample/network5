import ComponentInterface from '../interfaces/RenderData/ComponentInterface';
import PageInterface from '../interfaces/RenderData/PageInterface';
import Component from './Component';
import { ServiceRegistryComponentInterface } from '../interfaces/ServiceRegistryComponentInterface';
import Page from './Page';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export default abstract class PageHandlerComponent extends Component {
  services: ServiceRegistryComponentInterface;
  page: Page;

  loadRenderData(
    renderData: ComponentInterface,
    requestOptions: RequestOptionsInterface
  ) {
    super.loadRenderData(renderData, requestOptions);

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
   * @param renderData
   */
  public abstract renderPageEl(renderData: PageInterface);

  public abstract getPageEl(): HTMLElement;

  public setPage(page: Page) {
    this.page = page;
  }
}
