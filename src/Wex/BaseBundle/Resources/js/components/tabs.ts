import Component from "../class/Component";

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    init(renderData) {
      super.init(renderData);

      console.log('tabs !');
    }
  }
};
