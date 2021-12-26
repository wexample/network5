import AppService from '../class/AppService';
import PageInterface from '../interfaces/RequestOptions/PageInterface';
import { PageInterface as ServiceRegistryPageInterface } from '../interfaces/ServiceRegistry/PageInterface';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RenderNode from '../class/RenderNode';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';

export default abstract class RenderNodeService extends AppService {
  pages: {};
  services: ServiceRegistryPageInterface;

  public async prepareRenderData(renderData: RenderDataInterface) {
    await this.services.mixins.invokeUntilComplete(
      'prepareRenderData',
      'app',
      [renderData]
    );

    // Do not deep freeze as sub-parts might be prepared later.
    Object.freeze(renderData);
  }

  async createRenderNode(
    definitionName: string,
    el: HTMLElement,
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface
  ): Promise<RenderNode> {

    await this.prepareRenderData(renderData);

    let classDefinition = await this.app.getBundleClassDefinition(definitionName, true);

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

  get(path: string, options: PageInterface): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}
