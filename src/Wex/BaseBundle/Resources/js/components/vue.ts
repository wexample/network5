import Component from "../class/Component";

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    init(complete?: Function) {
      super.init(complete);

      console.log('Vue components loaded');
    }
  }
};
