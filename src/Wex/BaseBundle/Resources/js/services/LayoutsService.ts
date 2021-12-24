import RenderNodeService from './RenderNodeService';
import LayoutInterface from "../interfaces/RenderData/LayoutInterface";

export default class LayoutsService extends RenderNodeService {
  registerHooks() {
    return {
      app: {
        async loadRenderData(
          renderData: LayoutInterface,
        ) {
          this.app.layout.mergeRenderData(renderData);
        },
      },
    };
  }
}
