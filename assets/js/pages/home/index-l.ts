import PageResponsiveDisplay from '../../../../src/Wex/BaseBundle/Resources/js/class/PageResponsiveDisplay';
import AssetBundleInterface from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface';

const bundle: AssetBundleInterface = {
  bundleGroup: 'page',

  definition: class extends PageResponsiveDisplay {
    onResponsiveEnter() {
      console.log('index l init');
    }

    onResponsiveExit() {
      console.log('index l exit');
    }
  },
};

export default bundle;
