import AppService from '../class/AppService';
import PageInterface from '../interfaces/RequestOptions/PageInterface';
import { PageInterface as ServiceRegistryPageInterface } from '../interfaces/ServiceRegistry/PageInterface';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RenderNode from '../class/RenderNode';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';

export default abstract class RenderNodeService extends AppService {
  pages: {};
  services: ServiceRegistryPageInterface;

  async createRenderNode(
    classDefinition: any,
    el: HTMLElement,
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface
  ): Promise<RenderNode> {
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

  async prepareRenderNodeDefinition(renderData: RenderDataInterface) {
    await this.services.assets.loadValidAssetsInCollection(renderData.assets);

    return this.app.getBundleClassDefinition(renderData.name, true);
  }

  get(path: string, options: PageInterface): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}
