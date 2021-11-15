import RenderDataComponentInterface from "../interfaces/RenderDataComponentInterface";
import RenderDataPageInterface from "../interfaces/RenderDataPageInterface";
import Page from "../class/Page";
import PageHandlerComponent from "../class/PageHandlerComponent";

export default {
  bundleGroup: 'component',

  definition: class extends PageHandlerComponent {
    opened: boolean = false
    elContent: HTMLElement

    init(renderData: RenderDataComponentInterface) {
      this.elContent = this.el.querySelector('.modal-content');

      super.init(renderData);

      this.open();
    }

    public renderPageEl(renderData: RenderDataPageInterface, page: Page): HTMLElement {
      this.elContent.innerHTML = renderData.body;
      return this.elContent;
    }

    open() {
      if (this.opened) {
        return;
      }

      this.opened = true;
      this.el.classList.remove('closed');
      this.el.classList.add('opened');
console.log('OPEN')
    }
  },
};
