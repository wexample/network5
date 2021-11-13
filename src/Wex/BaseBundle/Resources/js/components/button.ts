import Component from '../class/Component';
import { MDCRipple } from '@material/ripple/index';

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    init() {
      new MDCRipple(this.el);
    }
  },
};
