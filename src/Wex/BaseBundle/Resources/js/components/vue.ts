import Component from '../class/Component';
import ComponentInterface from '../interfaces/RenderData/ComponentInterface';

export default class extends Component {
  loadRenderData(renderData: ComponentInterface) {
    super.loadRenderData(renderData);

    this.app.services['vue']
      .createVueAppForComponent(renderData.options.path, renderData)
      .mount(this.el);
  }
}
