import AssetBundleInterface from '../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface';
import Component from '../../../src/Wex/BaseBundle/Resources/js/class/Component';
import ComponentRenderDataInterface from '../../../src/Wex/BaseBundle/Resources/js/interfaces/ComponentRenderDataInterface';

const bundle: AssetBundleInterface = {
  bundleGroup: 'component',

  definition: class extends Component {
    init(renderData: ComponentRenderDataInterface) {
      this.el.innerHTML = `<span class="success">✓</span>${this.el.innerHTML}`;
    }
  },
};

export default bundle;
