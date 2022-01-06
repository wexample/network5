import RenderNodeService from './RenderNodeService';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';

export default class LayoutsService extends RenderNodeService {
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
