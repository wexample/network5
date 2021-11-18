import Component from '../class/Component';
import { MDCRipple } from '@material/ripple/index';
import RenderDataComponentInterface from "../interfaces/RenderDataComponentInterface";

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    init(renderData: RenderDataComponentInterface) {
      super.init(renderData);

      new MDCRipple(this.el);
    }
  },
};
