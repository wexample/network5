import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import App from './App';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import Page from './Page';
import Component from './Component';
import { ServiceRegistryComponentInterface } from '../interfaces/ServiceRegistryComponentInterface';

export default abstract class PageHandlerComponent extends Component {
  services: ServiceRegistryComponentInterface;

  protected constructor(
    app: App,
    elContext: HTMLElement,
    renderData: RenderDataComponentInterface
  ) {
    super(app, elContext, renderData);

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
   * @param page
   */
  public abstract renderPageEl(page: Page, renderData: RenderDataPageInterface);

  public abstract getPageEl(): HTMLElement;

  public abstract initPage(
    page: Page,
    renderData: RenderDataPageInterface
  ): void;
}
