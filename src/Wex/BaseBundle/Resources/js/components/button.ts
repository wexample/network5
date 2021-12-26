import Component from '../class/Component';
import { MDCRipple } from '@material/ripple/index';
import ComponentInterface from '../interfaces/RenderData/ComponentInterface';

export default class extends Component {
  loadRenderData(
    renderData: ComponentInterface
  ) {
    super.loadRenderData(renderData);

    new MDCRipple(this.el);
  }
}
