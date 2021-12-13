import AppService from '../class/AppService';
import RequestOptionsPageInterface from '../interfaces/RequestOptionsPageInterface';
import { ServiceRegistryPageInterface } from '../interfaces/ServiceRegistryPageInterface';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import RenderNode from '../class/RenderNode';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export default abstract class RenderNodeService extends AppService {
  pages: {};
  services: ServiceRegistryPageInterface;

  async createRenderNode(
    el: HTMLElement,
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface
  ): Promise<RenderNode> {
    let classDefinition = await this.prepareRenderNodeDefinition(renderData);

    let instance = this.createRenderNodeInstance(
      el,
      renderData,
      classDefinition
    );


    instance.loadRenderData(renderData, requestOptions);

    await instance.init();

    return instance;
  }

  createRenderNodeInstance(
    el: HTMLElement,
    renderData: RenderDataInterface,
    classDefinition: any
  ): RenderNode | null {
    return new classDefinition(this.app, el);
  }

  async prepareRenderNodeDefinition(
    renderData: RenderDataInterface
  ) {
    await this.services.assets.loadValidAssetsInCollection(renderData.assets);

    return this.app.getBundleClassDefinition(
      renderData.name,
      true
    );
  }

  get(path: string, options: RequestOptionsPageInterface): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}
