import AppService from '../class/AppService';
import RequestOptionsPageInterface from '../interfaces/RequestOptionsPageInterface';
import { ServiceRegistryPageInterface } from '../interfaces/ServiceRegistryPageInterface';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import RenderNode from '../class/RenderNode';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export default abstract class RenderNodeService extends AppService {
  pages: {};
  services: ServiceRegistryPageInterface;

  createRenderNode(
    el: HTMLElement,
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface,
    complete?: Function
  ) {
    this.prepareRenderNodeDefinition(renderData, (classDefinition) => {
      let instance = this.createRenderNodeInstance(
        el,
        renderData,
        classDefinition
      );

      instance.loadRenderData(renderData, requestOptions);

      instance.init(complete);
    });
  }

  createRenderNodeInstance(
    el: HTMLElement,
    renderData: RenderDataInterface,
    classDefinition: any
  ): RenderNode | null {
    return new classDefinition(this.app, el);
  }

  prepareRenderNodeDefinition(
    renderData: RenderDataInterface,
    complete?: Function
  ) {
    this.services.assets.updateAssetsCollection(renderData.assets, () => {
      let classDefinition = this.app.getBundleClassDefinition(renderData.name, true);

      complete && complete(classDefinition);
    });
  }

  get(path: string, options: RequestOptionsPageInterface): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}
