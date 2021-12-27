import Component from '../class/Component';
import { MDCRipple } from '@material/ripple/index';

export default class extends Component {
  async init() {
    await super.init();

    new MDCRipple(this.el);
  }
}
