import AssetBundleInterface from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface';
import PageResponsiveDisplay from '../../../../src/Wex/BaseBundle/Resources/js/class/PageResponsiveDisplay';

const bundle: AssetBundleInterface = {
  bundleGroup: 'page',

  definition: class extends PageResponsiveDisplay {
    onResponsiveEnter() {
      console.log('index m init');
    }

    onResponsiveExit() {
      console.log('index m exit');
    }
  },
};

export default bundle;
