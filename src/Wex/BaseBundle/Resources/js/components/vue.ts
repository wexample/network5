import Component from '../class/Component';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';

export default class extends Component {
  loadRenderData(
    renderData: RenderDataComponentInterface,
    requestOptions: RequestOptionsInterface
  ) {
    super.loadRenderData(renderData, requestOptions);

    this.app.services['vue']
      .createVueAppForComponent(
        renderData.options.path,
        renderData,
        requestOptions
      ).mount(this.el);
  }
};
