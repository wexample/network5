import Component from '../class/Component';
import RenderDataComponentInterface from "../interfaces/RenderDataComponentInterface";

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    init(renderData: RenderDataComponentInterface) {
      console.log(' MODAL !! ');
    }
  },
};
