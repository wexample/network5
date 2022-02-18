import AppService from '../class/AppService';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import RenderNode from '../class/RenderNode';
import ServicesRegistryInterface from '../interfaces/ServicesRegistryInterface';

export class ComponentsServiceEvents {
  public static CREATE_RENDER_NODE: string = 'create-render-node';
}

export default abstract class AbstractRenderNodeService extends AppService {
  public pages: {};
  public services: ServicesRegistryInterface;

  public async prepareRenderData(renderData: RenderDataInterface) {
    renderData.requestOptions = renderData.requestOptions || {};

    await this.services.mixins.invokeUntilComplete(
      'hookPrepareRenderData',
      'app',
      [renderData]
    );

    // Do not deep freeze as sub-parts might be prepared later.
    Object.seal(renderData);
  }

  async createRenderNode(
    definitionName: string,
    renderData: RenderDataInterface,
    parentRenderNode?: RenderNode
  ): Promise<RenderNode> {
    await this.prepareRenderData(renderData);

    await this.services.mixins.invokeUntilComplete(
      'hookBeforeCreate',
      'renderNode',
      [definitionName, renderData, parentRenderNode]
    );

    let classDefinition = this.app.getBundleClassDefinition(
      definitionName,
      true
    );

    let instance = this.createRenderNodeInstance(
      classDefinition,
      parentRenderNode
    );

    instance.loadFirstRenderData(renderData);

    await instance.init();

    return instance;
  }

  createRenderNodeInstance(
    classDefinition: any,
    parentRenderNode: RenderNode
  ): RenderNode | null {
    return new classDefinition(this.app, parentRenderNode);
  }
}
