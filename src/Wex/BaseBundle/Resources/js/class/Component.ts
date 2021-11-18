import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import { findPreviousNode as DomFindPreviousNode } from '../helpers/Dom';
import App from './App';
import Events from '../helpers/Events';
import { ServiceRegistryComponentInterface } from '../interfaces/ServiceRegistryComponentInterface';
import RenderNode from "./RenderNode";

export default abstract class Component extends RenderNode {
  public autoActivateListeners: boolean = true;
  public el: HTMLElement;
  public elContext: HTMLElement;
  protected listenKeyboardKey: string[] = [];
  protected onKeyUpProxy: Function;
  public renderData: RenderDataComponentInterface;
  protected readonly services: ServiceRegistryComponentInterface;

  // Focus allows listening keyboard interactions.
  protected focused: boolean = false;

  public static INIT_MODE_CLASS: string = 'class';

  public static INIT_MODE_LAYOUT: string = 'layout';

  public static INIT_MODE_PARENT: string = 'parent';

  public static INIT_MODE_PREVIOUS: string = 'previous';

  constructor(app: App, parentRenderNode: RenderNode, elContext: HTMLElement) {
    super(app, parentRenderNode);

    this.elContext = elContext;
  }

  init(renderData) {
    super.init(renderData);

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

    if (this.autoActivateListeners) {
      this.activateListeners();
    }
  }

  public getId(): string {
    return this.renderData.id;
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
}
