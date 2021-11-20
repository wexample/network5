import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import App from '../../../../../../assets/js/class/App';
import { ComponentsService } from './Components';
import RenderNode from '../class/RenderNode';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import { RenderNodeService } from "./RenderNodeService";
import { PagesService } from "./Pages";

class DebugRenderNode {
  renderNode: RenderNode;
  borderColors: any = {
    component: 'yellow',
    page: 'blue',
    layout: 'red',
  };

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
  el: HTMLElement

  constructor(app: App) {
    super(app);
  }

  init() {
    this.el = document.createElement('div');
    this.app.layout.el.appendChild(this.el);

    this.addTrackers();
  }

  addTrackers() {
    this.addTrackersToRenderNodeService(this.app.services['components'] as ComponentsService);
    this.addTrackersToRenderNodeService(this.app.services['pages'] as PagesService);
  }

  addTrackersToRenderNodeService(renderNodeService: RenderNodeService) {
    let debugService = this;
    let methodOriginal = renderNodeService.createRenderNode;

    renderNodeService.createRenderNode = function (
      el: HTMLElement,
      parentRenderNode: RenderNode,
      renderData: RenderDataInterface,
      complete?: Function
    ): RenderNode | null {
      return methodOriginal.call(
        renderNodeService,
        el,
        parentRenderNode,
        renderData,
        (renderNode: RenderNode) => {
          debugService.initRenderNode(renderNode);
          complete && complete(renderNode);
        });
    };
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
        this.app.services.debug.init();
      },
    },
  },
};
