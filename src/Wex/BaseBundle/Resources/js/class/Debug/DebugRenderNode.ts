import AppChild from "../AppChild";
import RenderNode from "../RenderNode";
import { DebugService } from "../../mixins/Debug";

export default class DebugRenderNode extends AppChild {
  borderColors: any = {
    component: 'yellow',
    page: 'blue',
    layout: 'red',
  };
  el: HTMLElement;
  renderNode: RenderNode;
  service: DebugService;

  constructor(renderNode) {
    super(renderNode.app);

    this.renderNode = renderNode;
    this.service = this.app.services['debug'] as DebugService;

    this.createEl();

    this.update();
  }

  convertPosition(number) {
    return `${number}px`;
  }

  createEl() {
    this.el = document.createElement('div');
    this.el.classList.add('debug-render-node');
    this.el.style.borderColor = this.getBorderColor();
    this.service.el.appendChild(this.el);
  }

  update() {
    let rect = this.renderNode.el.getBoundingClientRect();

    Object.assign(this.el.style, {
      top: this.convertPosition(rect.top),
      left: this.convertPosition(rect.left),
      width: this.convertPosition(rect.width),
      height: this.convertPosition(rect.height),
    });
  }

  getBorderColor(): string {
    return this.borderColors[this.renderNode.getRenderNodeType()];
  }
}