import AbstractRenderNodeService from './AbstractRenderNodeService';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';

export default class LayoutsService extends AbstractRenderNodeService {
  registerHooks() {
    return {
      app: {
        async hookLoadLayoutRenderData(renderData: LayoutInterface) {
          this.app.layout.mergeRenderData(renderData);
        },
      },
    };
  }
}
