import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import { ComponentsService } from './Components';
import RenderNode from '../class/RenderNode';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import { RenderNodeService } from "./RenderNodeService";
import { PagesService } from "./Pages";
import Variables from "../helpers/Variables";
import DebugRenderNode from "../class/Debug/DebugRenderNode";
import RequestOptionsInterface from "../interfaces/RequestOptionsInterface";

export class DebugService extends AppService {
  public renderNodes: any = {};
  public elDebugHelpers: HTMLElement
  public elDebugHelpersGlobal: HTMLElement

  init() {
    this.createEl();
    this.addTrackers();
  }

  createEl() {
    this.elDebugHelpers = document.createElement('div');
    let componentsService = this.app.services[Variables.PLURAL_COMPONENT] as ComponentsService;
    this.elDebugHelpers.setAttribute(Variables.ID, 'layout-debug-helpers');

    this.elDebugHelpersGlobal = document.createElement('div');
    this.elDebugHelpers.appendChild(this.elDebugHelpersGlobal);

    componentsService
      .elLayoutComponents.parentNode
      .insertBefore(
        this.elDebugHelpers,
        componentsService.elLayoutComponents
      );
  }

  addTrackers() {
    this.addTrackersToRenderNodeService(this.app.services[Variables.PLURAL_COMPONENT] as ComponentsService);
    this.addTrackersToRenderNodeService(this.app.services[Variables.PLURAL_PAGE] as PagesService);
  }

  addTrackersToRenderNodeService(renderNodeService: RenderNodeService) {
    let debugService = this;
    let methodOriginal = renderNodeService.createRenderNode;

    renderNodeService.createRenderNode = function (
      el: HTMLElement,
      parentRenderNode: RenderNode,
      renderData: RenderDataInterface,
      requestOptions: RequestOptionsInterface,
      complete?: Function
    ): RenderNode | null {
      return methodOriginal.call(
        renderNodeService,
        el,
        parentRenderNode,
        renderData,
        requestOptions,
        (renderNode: RenderNode) => {
          debugService.initRenderNode(renderNode);
          complete && complete(renderNode);
        });
    };
  }

  initRenderNode(renderNode: RenderNode) {
    // After app loaded.
    this.app.ready(() => {
      // Wait rendering complete.
      setTimeout(() => {
        this.renderNodes[renderNode.getId()] = new DebugRenderNode(renderNode);
      }, 100);
    });
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
