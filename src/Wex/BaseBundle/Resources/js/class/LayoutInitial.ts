import Layout from "./Layout";
import RenderDataLayoutInterface from "../interfaces/RenderDataLayoutInterface";
import App from "./App";

export default class extends Layout {
  public id: string = 'layout-initial';

  constructor(app: App) {
    super(app);

    this.renderData = window['appRegistry'].layoutRenderData as RenderDataLayoutInterface;
  }
}
