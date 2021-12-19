import Component from '../class/Component';
import { MDCRipple } from '@material/ripple/index';
import ComponentInterface from '../interfaces/RenderData/ComponentInterface';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';

export default class extends Component {
  loadRenderData(
    renderData: ComponentInterface,
    requestOptions: RequestOptionsInterface
  ) {
    super.loadRenderData(renderData, requestOptions);

    new MDCRipple(this.el);
  }
}
