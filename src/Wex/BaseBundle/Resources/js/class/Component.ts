import ComponentInterface from '../interfaces/RenderData/ComponentInterface';
import Events from '../helpers/Events';
import RenderNode from './RenderNode';
import { findPreviousNode as DomFindPreviousNode } from '../helpers/Dom';
import AppInterface from '../interfaces/ServicesRegistryInterface';

export default abstract class Component extends RenderNode {
  protected initMode: string;
  protected listenKeyboardKey: string[] = [];
  protected onKeyUpProxy: Function;
  public options: any = {};
  public renderData: ComponentInterface;
  protected readonly services: AppInterface;

  public static INIT_MODE_CLASS: string = 'class';

  public static INIT_MODE_LAYOUT: string = 'layout';

  public static INIT_MODE_PARENT: string = 'parent';

  public static INIT_MODE_PREVIOUS: string = 'previous';

  public async init() {
    await super.init();

    await this.services.mixins.invokeUntilComplete(
      'hookInitComponent',
      'component',
      [this]
    );
  }

  attachHtmlElements() {
    let el: HTMLElement;

    let elPlaceholder = this.parentRenderNode.el.querySelector(
      `.${this.id}`
    ) as HTMLElement;
    let removePlaceHolder = true;

    if (!elPlaceholder) {
      this.services.prompt.systemError(
        'page_message.error.com_placeholder_missing',
        {},
        this
      );
    }

    switch (this.initMode) {
      case Component.INIT_MODE_CLASS:
        el = elPlaceholder;
        removePlaceHolder = false;
        break;
      case Component.INIT_MODE_PARENT:
        el = elPlaceholder.parentElement;
        break;
      case Component.INIT_MODE_LAYOUT:
      case Component.INIT_MODE_PREVIOUS:
        el = DomFindPreviousNode(elPlaceholder);
        break;
    }

    if (removePlaceHolder) {
      // Remove placeholder tag as it may interact with CSS or JS selectors.
      elPlaceholder.remove();
    }

    if (!el) {
      this.services.prompt.systemError(
        'page_message.error.com_el_missing',
        {},
        this
      );
    }

    this.el = el;
  }

  public async exit() {
    await super.exit();

    this.deactivateListeners();

    this.el.remove();
  }

  mergeRenderData(renderData: ComponentInterface) {
    super.mergeRenderData(renderData);

    this.initMode = renderData.initMode;
    this.options = {...this.options, ...renderData.options};
    this.callerPage = renderData.requestOptions.callerPage;
    this.initMode = renderData.initMode;
  }

  public getRenderNodeType(): string {
    return 'component';
  }

  protected onKeyUp(event: KeyboardEvent) {
    if (this.focused && this.listenKeyboardKey.indexOf(event.key) !== -1) {
      this.onListenedKeyUp(event);
    }
  }

  protected async activateListeners(): Promise<void> {
    if (this.listenKeyboardKey.length) {
      this.onKeyUpProxy = this.onKeyUp.bind(this);

      document.addEventListener(
        Events.KEYUP,
        this.onKeyUpProxy as EventListenerOrEventListenerObject
      );
    }
  }

  protected async deactivateListeners(): Promise<void> {
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
}
