import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import App from "../../../../../../assets/js/class/App";
import { ComponentsService } from "./Components";
import RenderDataComponentInterface from "../interfaces/RenderDataComponentInterface";
import Page from "../class/Page";
import Component from "../class/Component";
import RenderNode from "../class/RenderNode";
import RenderDataInterface from "../interfaces/RenderDataInterface";

class DebugRenderNode {
  renderNode: RenderNode
  borderColors: any = {
    component: 'yellow',
    page: 'blue',
    layout: 'red',
  }

  constructor(renderNode) {
    this.renderNode = renderNode;

    this.show();
  }

  show() {
    if (this.renderNode.el) {
      this.renderNode.el.style.border = `4px solid ${this.getBorderColor()}`;
    }
  }

  getBorderColor(): string {
    return this.borderColors[this.renderNode.getRenderNodeType()];
  }
}

export class DebugService extends AppService {
  renderNodes: any = {};

  constructor(app: App) {
    super(app);
  }

  addTrackers() {
    let mixinService = this.app.services['components'] as ComponentsService;
    let debugService = this;
    let methodOriginal = mixinService.createRenderNode;

    mixinService.createRenderNode = function (
      el: HTMLElement,
      page: Page = null,
      renderData: RenderDataInterface,
      complete?: Function
    ) {
      methodOriginal.call(
        this,
        el,
        page,
        renderData,
        function (renderNode: Component) {
          debugService.initRenderNode(renderNode);
          complete && complete.apply(this, arguments);
        },
      );
    }
  }

  initRenderNode(renderNode: RenderNode) {
    this.renderNodes[renderNode.getId()] = new DebugRenderNode(renderNode);
  }
}

export const MixinDebug: MixinInterface = {
  name: 'debug',

  service: DebugService,

  hooks: {
    app: {
      init() {
        this.app.services.debug.addTrackers();
      },
    },
  },
};