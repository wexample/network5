import AssetBundleInterface from '../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface';
import Component from '../../../src/Wex/BaseBundle/Resources/js/class/Component';
import RenderDataComponentInterface from '../../../src/Wex/BaseBundle/Resources/js/interfaces/RenderDataComponentInterface';

const bundle: AssetBundleInterface = {
  bundleGroup: 'component',

  definition: class extends Component {
    mounted() {
      this.el.innerHTML = `<span class="success">✓</span>${this.el.innerHTML}`;
    }
  },
};

export default bundle;
