import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';
import Page from '../class/Page';
import PageHandlerComponent from '../class/PageHandlerComponent';
import Keyboard from '../helpers/Keyboard';
import Mouse from '../helpers/Mouse';
import Variables from '../helpers/Variables';
import Events from '../helpers/Events';

export default {
  bundleGroup: 'component',

  definition: class extends PageHandlerComponent {
    closing: boolean;
    elContent: HTMLElement;
    listenKeyboardKey: string[] = [Keyboard.KEY_ESCAPE];
    mouseDownOverlayTarget: EventTarget | null;
    mouseDownOverlayTimestamp: number | null;
    onMouseDownOverlayProxy: EventListenerObject;
    onMouseUpOverlayProxy: EventListenerObject;
    opened: boolean = false;

    init(renderData: RenderDataComponentInterface) {
      this.elContent = this.el.querySelector('.modal-content');

      super.init(renderData);

      this.open();
    }

    public renderPageEl(
      renderData: RenderDataPageInterface,
      page: Page
    ): HTMLElement {
      this.elContent.innerHTML = renderData.body;
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

      this.el.addEventListener(Events.MOUSEDOWN, this.onMouseDownOverlayProxy);
      this.el.addEventListener(Events.MOUSEUP, this.onMouseUpOverlayProxy);
    }

    protected deactivateListeners(): void {
      super.deactivateListeners();

      this.el.removeEventListener(
        Events.MOUSEDOWN,
        this.onMouseDownOverlayProxy
      );
      this.el.removeEventListener(Events.MOUSEUP, this.onMouseUpOverlayProxy);
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
        this.el.classList.remove(Variables.CLOSED);
        this.opened = this.focused = this.closing = false;
      }, 400);
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
