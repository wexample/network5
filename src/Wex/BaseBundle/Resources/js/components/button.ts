import Component from '../class/Component';
import { MDCRipple } from '@material/ripple/index';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    loadRenderData(renderData: RenderDataComponentInterface) {
      super.loadRenderData(renderData);

      new MDCRipple(this.el);
    }
  },
};
