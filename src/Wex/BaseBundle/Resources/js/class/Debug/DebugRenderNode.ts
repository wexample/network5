import AppChild from "../AppChild";
import RenderNode from "../RenderNode";
import { DebugService } from "../../mixins/Debug";
import Variables from "../../helpers/Variables";

export default class DebugRenderNode extends AppChild {
  public borderColors: any = {
    component: 'yellow',
    page: 'blue',
    layout: 'red',
  };
  public el: HTMLElement;
  public elDebugHelpers: HTMLElement;
  public renderNode: RenderNode;
  protected service: DebugService;

  constructor(renderNode) {
    super(renderNode.app);

    this.renderNode = renderNode;
    this.service = this.app.services['debug'] as DebugService;

    this.createEl();

    if (this.renderNode.getRenderNodeType() === Variables.PAGE) {
      this.createElDebugHelpers();
    }

    this.addTrackers();
    this.update();
  }

  addTrackers() {
    let renderNode = this.renderNode;
    let methodOriginal = renderNode.exit;
    let debugRenderNode = this;

    this.renderNode.exit = function () {
      debugRenderNode.el.parentNode.removeChild(
        debugRenderNode.el
      );

      if (debugRenderNode.renderNode.getRenderNodeType() === Variables.PAGE) {
        debugRenderNode.elDebugHelpers.parentNode.removeChild(
          debugRenderNode.elDebugHelpers
        );
      }

      methodOriginal.apply(
        renderNode,
        arguments
      );
    }
  }

  convertPosition(number) {
    return `${number}px`;
  }

  createEl() {
    this.el = document.createElement('div');
    this.el.classList.add('debug-render-node');
    this.el.style.borderColor = this.getBorderColor();
    this.service.elDebugHelpers.appendChild(this.el);
  }

  createElDebugHelpers() {
    this.elDebugHelpers = document.createElement('div');
    this.service.elDebugHelpers.appendChild(this.elDebugHelpers);
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