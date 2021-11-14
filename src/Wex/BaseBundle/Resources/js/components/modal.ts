import Component from '../class/Component';

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    init() {
      console.log(' MODAL !');
    }
  },
};
