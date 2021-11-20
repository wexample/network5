import Component from '../class/Component';
import { MDCRipple } from '@material/ripple/index';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import RequestOptionsInterface from "../interfaces/RequestOptionsInterface";

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    loadRenderData(
      renderData: RenderDataComponentInterface,
      requestOptions: RequestOptionsInterface
    ) {
      super.loadRenderData(
        renderData,
        requestOptions
      );

      new MDCRipple(this.el);
    }
  },
};
