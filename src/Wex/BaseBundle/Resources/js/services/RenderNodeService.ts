import AppService from '../class/AppService';
import PageInterface from '../interfaces/RequestOptions/PageInterface';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RenderNode from '../class/RenderNode';
import AppInterface from "../interfaces/ServicesRegistryInterface";

export class ComponentsServiceEvents {
  public static CREATE_RENDER_NODE: string = 'create-render-node';
}

export default abstract class RenderNodeService extends AppService {
  pages: {};
  services: AppInterface;

  public async prepareRenderData(renderData: RenderDataInterface) {
    renderData.requestOptions = renderData.requestOptions || {};

    await this.services.mixins.invokeUntilComplete(
      'prepareRenderData',
      'app',
      [
        renderData,
      ]
    );

    // Do not deep freeze as sub-parts might be prepared later.
    Object.freeze(renderData);
  }

  async createRenderNode(
    definitionName: string,
    renderData: RenderDataInterface,
    parentRenderNode?: RenderNode
  ): Promise<RenderNode> {
    await this.prepareRenderData(renderData);

    let classDefinition = this.app.getBundleClassDefinition(
      definitionName,
      true
    );

    let instance = this.createRenderNodeInstance(
      classDefinition,
      parentRenderNode
    );

    instance.loadRenderData(renderData);

    await instance.init();

    return instance;
  }

  createRenderNodeInstance(
    classDefinition: any,
    parentRenderNode: RenderNode
  ): RenderNode | null {
    return new classDefinition(this.app, parentRenderNode);
  }

  get(path: string, options: PageInterface): Promise<any> {
    return this.services.adaptive.get(path, options);
  }
}