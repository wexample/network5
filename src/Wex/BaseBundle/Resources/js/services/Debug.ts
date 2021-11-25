import AppService from '../class/AppService';
import ComponentsService from './Components';
import RenderNode from '../class/RenderNode';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import RenderNodeService from './RenderNodeService';
import PagesService from './Pages';
import Variables from '../helpers/Variables';
import DebugRenderNode from '../class/Debug/DebugRenderNode';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export default class DebugService extends AppService {
  public debugRenderNodes: any = {};
  public elDebugHelpers: HTMLElement;
  public elDebugHelpersGlobal: HTMLElement;

  registerHooks() {
    return {
      app: {
        init() {
          this.app.services.debug.init();
        },
      },
    };
  }

  init() {
    this.createEl();
    this.addTrackers();

    window.addEventListener('resize', () => this.update());
    window.addEventListener('scroll', () => this.update(), true);
  }

  createEl() {
    this.elDebugHelpers = document.createElement('div');
    this.elDebugHelpers.setAttribute(Variables.ID, 'layout-debug-helpers');

    this.elDebugHelpersGlobal = document.createElement('div');
    this.elDebugHelpers.appendChild(this.elDebugHelpersGlobal);

    this.app.layout.el.appendChild(this.elDebugHelpers);
  }

  addTrackers() {
    this.addTrackersToRenderNodeService(
      this.app.services[Variables.PLURAL_COMPONENT] as ComponentsService
    );
    this.addTrackersToRenderNodeService(
      this.app.services[Variables.PLURAL_PAGE] as PagesService
    );
  }

  addTrackersToRenderNodeService(renderNodeService: RenderNodeService) {
    let debugService = this;
    let methodOriginal = renderNodeService.createRenderNodeInstance;

    renderNodeService.createRenderNodeInstance = function (
      el: HTMLElement,
      renderData: RenderDataInterface,
      requestOptions: RequestOptionsInterface,
      complete?: Function
    ): RenderNode | null {
      let instance = methodOriginal.apply(renderNodeService, arguments);

      debugService.initRenderNode(instance);

      return instance;
    };
  }

  initRenderNode(renderNode: RenderNode) {
    new DebugRenderNode(renderNode);
  }

  update() {
    Object.values(this.debugRenderNodes).forEach(
      (debugRenderNode: DebugRenderNode) => {
        debugRenderNode.update();
      }
    );
  }
}