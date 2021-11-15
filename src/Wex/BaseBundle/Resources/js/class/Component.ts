import AppChild from './AppChild';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import {findPreviousNode as DomFindPreviousNode} from '../helpers/Dom';
import ServiceRegistryAppInterface from "../interfaces/ServiceRegistryAppInterface";
import {ComponentsService} from "../mixins/Components";
import App from "./App";
import RenderDataPageInterface from "../interfaces/RenderDataPageInterface";
import Page from "./Page";

interface ServiceRegistryComponentInterface extends ServiceRegistryAppInterface {
  components: ComponentsService;
}

export default abstract class Component extends AppChild {
  el: HTMLElement;
  elContext: HTMLElement;
  services: ServiceRegistryComponentInterface;

  public static INIT_MODE_CLASS: string = 'class';

  public static INIT_MODE_LAYOUT: string = 'layout';

  public static INIT_MODE_PARENT: string = 'parent';

  public static INIT_MODE_PREVIOUS: string = 'previous';

  protected constructor(
    app: App,
    elContext: HTMLElement,
    renderData: RenderDataComponentInterface
  ) {
    super(app);

    this.elContext = elContext;
    let elPlaceholder = this.elContext.querySelector(
      '.' + renderData.id
    ) as HTMLElement;
    let removePlaceHolder = true;

    switch (renderData.initMode) {
      case Component.INIT_MODE_CLASS:
        this.el = elPlaceholder;
        removePlaceHolder = false;
        break;
      case Component.INIT_MODE_PARENT:
      case Component.INIT_MODE_LAYOUT:
        this.el = elPlaceholder.parentElement;
        break;
      case Component.INIT_MODE_PREVIOUS:
        this.el = DomFindPreviousNode(elPlaceholder);
        break;
    }

    if (removePlaceHolder) {
      // Remove placeholder tag as it may interact with CSS or JS selectors.
      elPlaceholder.parentNode.removeChild(elPlaceholder);
    }

    // This component is defined as the manager of
    // rendered page from the request.
    // Basically a modal or a panel (layout level).
    if (renderData.options.adaptiveResponseBodyDestination) {
      // Save component in registry for further usage.
      this.services.components.pageHandlerRegistry[renderData.renderRequestId] = this;
    }
  }

  public init(renderData: RenderDataComponentInterface) {
    // To override...
  }

  public renderPageData(renderData: RenderDataPageInterface, page: Page) {
    // Used by page handlers (modal / panels)
    this.el.innerHTML = renderData.body;
  }
}
