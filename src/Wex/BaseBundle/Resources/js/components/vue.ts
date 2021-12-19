import Component from '../class/Component';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';
import ComponentInterface from '../interfaces/RenderData/ComponentInterface';

export default class extends Component {
  loadRenderData(
    renderData: ComponentInterface,
    requestOptions: RequestOptionsInterface
  ) {
    super.loadRenderData(renderData, requestOptions);

    this.app.services['vue']
      .createVueAppForComponent(
        renderData.options.path,
        renderData,
        requestOptions
      )
      .mount(this.el);
  }
}
