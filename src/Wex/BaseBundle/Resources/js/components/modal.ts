import Page from '../class/Page';
import PageManagerComponent from '../class/PageManagerComponent';
import Keyboard from '../helpers/Keyboard';
import Mouse from '../helpers/Mouse';
import Variables from '../helpers/Variables';
import Events from '../helpers/Events';
import RenderNode from '../class/RenderNode';

export default class ModalComponent extends PageManagerComponent {
  public closing: boolean;
  public listenKeyboardKey: string[] = [Keyboard.KEY_ESCAPE];
  public mouseDownOverlayTarget: EventTarget | null;
  public mouseDownOverlayTimestamp: number | null;
  public onClickCloseProxy: EventListenerObject;
  public onMouseDownOverlayProxy: EventListenerObject;
  public onMouseUpOverlayProxy: EventListenerObject;
  public opened: boolean = false;

  attachHtmlElements() {
    super.attachHtmlElements();

    this.elements.content = this.el.querySelector('.modal-content');
  }

  childMounted(renderNode: RenderNode) {
    // When mounting the el of the page,
    // we are now able to define the base size of it,
    // it will be used to chose proper responsive assets.
    if (renderNode === this.page) {
      this.showEl();
      this.page.updateElSize();
      this.hideEl();
    }
  }

  appendChildRenderNode(renderNode: RenderNode) {
    super.appendChildRenderNode(renderNode);

    if (renderNode instanceof Page) {
      renderNode.ready(() => {
        this.open();
      });
    }
  }

  public renderPageEl(page: Page): HTMLElement {
    this.elements.content.innerHTML = page.renderData.body;

    this.el
      .querySelector('.modal-close a')
      .addEventListener(Events.CLICK, this.onClickCloseProxy);

    return this.getPageEl();
  }

  public getPageEl(): HTMLElement {
    return this.elements.content;
  }

  async onListenedKeyUp(event: KeyboardEvent) {
    if (event.key === Keyboard.KEY_ESCAPE) {
      await this.close();
    }
  }

  protected async activateListeners(): Promise<void> {
    await super.activateListeners();

    this.onMouseDownOverlayProxy = this.onMouseDownOverlay.bind(this);
    this.onMouseUpOverlayProxy = this.onMouseUpOverlay.bind(this);
    this.onClickCloseProxy = this.onClickClose.bind(this);

    this.el.addEventListener(Events.MOUSEDOWN, this.onMouseDownOverlayProxy);
    this.el.addEventListener(Events.MOUSEUP, this.onMouseUpOverlayProxy);
  }

  protected async deactivateListeners(): Promise<void> {
    await super.deactivateListeners();

    this.el.removeEventListener(Events.MOUSEDOWN, this.onMouseDownOverlayProxy);
    this.el.removeEventListener(Events.MOUSEUP, this.onMouseUpOverlayProxy);

    this.el
      .querySelector('.modal-close a')
      .removeEventListener(Events.CLICK, this.onClickCloseProxy);
  }

  showEl() {
    this.el.classList.remove(Variables.CLOSED);
    this.el.classList.add(Variables.OPENED);
  }

  hideEl() {
    this.el.classList.remove(Variables.OPENED);
    this.el.classList.add(Variables.CLOSED);
  }

  open() {
    if (this.opened) {
      return;
    }

    this.opened = true;

    this.showEl();

    this.focus();
  }

  close() {
    this.closing = true;

    this.hideEl();

    this.blur();

    return new Promise(async (resolve) => {
      // Sync with CSS animation.
      await setTimeout(async () => {
        this.el.classList.remove(Variables.CLOSED);
        this.opened = this.focused = this.closing = false;

        await this.exit();

        this.callerPage.focus();

        resolve(this);
      }, 400);
    });
  }

  async onClickClose() {
    await this.close();
  }

  onMouseDownOverlay(event: MouseEvent) {
    // Accept closing modal on clicking on the overlay,
    // only if the mousedown is started on the overlay itself.
    if (event.target === event.currentTarget) {
      this.mouseDownOverlayTarget = event.target;
      this.mouseDownOverlayTimestamp = Date.now();
    } else {
      this.mouseDownOverlayTarget = null;
      this.mouseDownOverlayTimestamp = null;
    }
  }

  async onMouseUpOverlay(event: MouseEvent) {
    // Check that click has been on the same element.
    // Then prevent too long clicks.
    if (
      event.target === this.mouseDownOverlayTarget &&
      Date.now() - this.mouseDownOverlayTimestamp < Mouse.CLICK_DURATION
    ) {
      await this.close();
    }
  }
}
