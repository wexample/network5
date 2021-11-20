import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import Page from '../class/Page';
import PageHandlerComponent from '../class/PageHandlerComponent';
import Keyboard from '../helpers/Keyboard';
import Mouse from '../helpers/Mouse';
import Variables from '../helpers/Variables';
import Events from '../helpers/Events';
import RenderNode from '../class/RenderNode';
import RequestOptionsModalInterface from "../interfaces/RequestOptionsModalInterface";

export default {
  bundleGroup: 'component',

  definition: class extends PageHandlerComponent {
    public closing: boolean;
    public elContent: HTMLElement;
    public listenKeyboardKey: string[] = [Keyboard.KEY_ESCAPE];
    public mouseDownOverlayTarget: EventTarget | null;
    public mouseDownOverlayTimestamp: number | null;
    public onClickCloseProxy: EventListenerObject;
    public onMouseDownOverlayProxy: EventListenerObject;
    public onMouseUpOverlayProxy: EventListenerObject;
    public opened: boolean = false;
    public callingPage: Page;

    loadRenderData(
      renderData: RenderDataComponentInterface,
      requestOptions: RequestOptionsModalInterface
    ) {
      super.loadRenderData(
        renderData,
        requestOptions
      );

      this.callingPage = requestOptions.callingPage;
      this.elContent = this.el.querySelector('.modal-content');
    }

    appendChildRenderNode(renderNode: RenderNode) {
      super.appendChildRenderNode(renderNode);

      if (renderNode instanceof Page) {
        this.open();
      }
    }

    public renderPageEl(renderData: RenderDataPageInterface) {
      this.elContent.innerHTML = renderData.body;
    }

    public getPageEl(): HTMLElement {
      return this.elContent;
    }

    onListenedKeyUp(event: KeyboardEvent) {
      if (event.key === Keyboard.KEY_ESCAPE) {
        this.close();
      }
    }

    protected activateListeners(): void {
      super.activateListeners();

      this.onMouseDownOverlayProxy = this.onMouseDownOverlay.bind(this);
      this.onMouseUpOverlayProxy = this.onMouseUpOverlay.bind(this);
      this.onClickCloseProxy = this.onClickClose.bind(this);

      this.el.addEventListener(Events.MOUSEDOWN, this.onMouseDownOverlayProxy);
      this.el.addEventListener(Events.MOUSEUP, this.onMouseUpOverlayProxy);

      this.el
        .querySelector('.modal-close a')
        .addEventListener(Events.CLICK, this.onClickCloseProxy);
    }

    protected deactivateListeners(): void {
      super.deactivateListeners();

      this.el.removeEventListener(
        Events.MOUSEDOWN,
        this.onMouseDownOverlayProxy
      );
      this.el.removeEventListener(Events.MOUSEUP, this.onMouseUpOverlayProxy);

      this.el
        .querySelector('.modal-close a')
        .removeEventListener(Events.CLICK, this.onClickCloseProxy);
    }

    open() {
      if (this.opened) {
        return;
      }

      this.opened = true;

      this.el.classList.remove(Variables.CLOSED);
      this.el.classList.add(Variables.OPENED);

      this.focus();
    }

    close() {
      this.closing = true;
      this.el.classList.remove(Variables.OPENED);
      this.el.classList.add(Variables.CLOSED);

      this.blur();

      // Sync with CSS animation.
      setTimeout(() => {
        this.page.exit();

        this.el.classList.remove(Variables.CLOSED);
        this.opened = this.focused = this.closing = false;

        this.exit();
      }, 400);
    }

    onClickClose() {
      this.close();
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

    onMouseUpOverlay(event: MouseEvent) {
      // Check that click has been on the same element.
      // Then prevent too long clicks.
      if (
        event.target === this.mouseDownOverlayTarget &&
        Date.now() - this.mouseDownOverlayTimestamp < Mouse.CLICK_DURATION
      ) {
        this.close();
      }
    }
  },
};
