import AppService from '../class/AppService';
import RequestOptionsPageInterface from '../interfaces/RequestOptionsPageInterface';
import { ServiceRegistryPageInterface } from '../interfaces/ServiceRegistryPageInterface';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import RenderNode from '../class/RenderNode';

export abstract class RenderNodeService extends AppService {
  pages: {};
  services: ServiceRegistryPageInterface;

  createRenderNode(
    el: HTMLElement,
    parentRenderNode: RenderNode,
    renderData: RenderDataInterface,
    complete?: Function
  ) {
    this.prepareRenderNodeDefinition(renderData, (classDefinition) => {
      let instance = this.createRenderNodeInstance(
        el,
        parentRenderNode,
        renderData,
        classDefinition
      );

      instance.loadRenderData(renderData);

      instance.init(complete);
    });
  }

  createRenderNodeInstance(
    el: HTMLElement,
    parentRenderNode: RenderNode,
    renderData: RenderDataInterface,
    classDefinition: any
  ): RenderNode | null {
    return new classDefinition(this.app, el, parentRenderNode);
  }

  prepareRenderNodeDefinition(
    renderData: RenderDataInterface,
    complete?: Function
  ) {
    this.services.assets.updateAssetsCollection(renderData.assets, () => {
      let classDefinition = this.app.getBundleClassDefinition(renderData.name);

      complete && complete(classDefinition);
    });
  }

  get(path: string, options: RequestOptionsPageInterface): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}
