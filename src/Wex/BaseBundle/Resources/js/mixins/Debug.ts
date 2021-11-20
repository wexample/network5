import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import App from '../../../../../../assets/js/class/App';
import { ComponentsService } from './Components';
import RenderNode from '../class/RenderNode';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import { RenderNodeService } from "./RenderNodeService";
import { PagesService } from "./Pages";
import AppChild from "../class/AppChild";

class DebugRenderNode extends AppChild {
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

    this.el = document.createElement('div');
    this.el.classList.add('debug-render-node');
    this.el.style.borderColor = this.getBorderColor();
    this.service.el.appendChild(this.el);

    this.app.ready(() => {
      this.app.layout.page.ready(() => {
        setTimeout(() => {
          this.update();
        },100);
      });
    });
  }

  convertPosition(number) {
    return `${number}px`;
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
