import RenderDataComponentInterface from "../interfaces/RenderDataComponentInterface";
import RenderDataPageInterface from "../interfaces/RenderDataPageInterface";
import Page from "../class/Page";
import PageHandlerComponent from "../class/PageHandlerComponent";
import Keyboard from "../helpers/Keyboard";

export default {
  bundleGroup: 'component',

  definition: class extends PageHandlerComponent {
    closing: boolean
    elContent: HTMLElement
    listenKeyboardKey: string[] = [Keyboard.KEY_ESCAPE]
    opened: boolean = false

    init(renderData: RenderDataComponentInterface) {
      this.elContent = this.el.querySelector('.modal-content');

      super.init(renderData);

      this.open();
    }

    public renderPageEl(renderData: RenderDataPageInterface, page: Page): HTMLElement {
      this.elContent.innerHTML = renderData.body;
      return this.elContent;
    }

    onListenedKeyUp(event: KeyboardEvent) {
      if (event.key === Keyboard.KEY_ESCAPE) {
        this.close();
      }
    }

    open() {
      if (this.opened) {
        return;
      }

      this.opened = true;
      this.focused = true;
      this.el.classList.remove('closed');
      this.el.classList.add('opened');
    }

    close() {
      this.el.classList.remove('opened');
      this.el.classList.add('closed');
      
      this.opened =
      this.focused =
      this.closing = false;
    }
  },
};
