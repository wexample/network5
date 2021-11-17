import AppChild from './AppChild';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import {findPreviousNode as DomFindPreviousNode} from '../helpers/Dom';
import App from './App';
import Events from '../helpers/Events';
import {ServiceRegistryComponentInterface} from "../interfaces/ServiceRegistryComponentInterface";

export default abstract class Component extends AppChild {
  autoActivateListeners: boolean = true;
  el: HTMLElement;
  elContext: HTMLElement;
  services: ServiceRegistryComponentInterface;
  listenKeyboardKey: string[] = [];
  onKeyUpProxy: Function;
  // Focus allows listening keyboard interactions.
  protected focused: boolean = false;

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
        this.el = elPlaceholder.parentElement;
        break;
      case Component.INIT_MODE_LAYOUT:
      case Component.INIT_MODE_PREVIOUS:
        this.el = DomFindPreviousNode(elPlaceholder);
        break;
    }

    if (removePlaceHolder) {
      // Remove placeholder tag as it may interact with CSS or JS selectors.
      elPlaceholder.parentNode.removeChild(elPlaceholder);
    }
  }

  protected onKeyUp(event: KeyboardEvent) {
    if (this.focused && this.listenKeyboardKey.indexOf(event.key) !== -1) {
      this.onListenedKeyUp(event);
    }
  }

  protected activateListeners(): void {
    if (this.listenKeyboardKey.length) {
      this.onKeyUpProxy = this.onKeyUp.bind(this);

      document.addEventListener(
        Events.KEYUP,
        this.onKeyUpProxy as EventListenerOrEventListenerObject
      );
    }
  }

  protected deactivateListeners(): void {
    if (this.listenKeyboardKey.length) {
      document.removeEventListener(
        Events.KEYUP,
        this.onKeyUpProxy as EventListenerOrEventListenerObject
      );
    }
  }

  protected onListenedKeyUp(event: KeyboardEvent) {
    // To override...
  }

  public focus() {
    this.focused = true;
    this.activateListeners();
  }

  public blur() {
    this.focused = false;
    this.deactivateListeners();
  }

  public remove() {
    this.deactivateListeners();

    this.el.parentNode.removeChild(this.el);
  }

  public init(renderData: RenderDataComponentInterface) {
    if (this.autoActivateListeners) {
      this.activateListeners();
    }
  }
}
