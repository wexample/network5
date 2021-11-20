import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import UnitTest from '../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest';
import AssetBundleInterface from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface';
import {
  MixinModals,
  ModalsService,
} from '../../../../src/Wex/BaseBundle/Resources/js/mixins/Modals';
import { ServiceRegistryPageInterface } from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/ServiceRegistryPageInterface';

interface ServiceRegistryPageCurrentInterface
  extends ServiceRegistryPageInterface {
  modals: ModalsService;
}

const bundle: AssetBundleInterface = {
  bundleGroup: 'page',

  definition: class extends Page {
    services: ServiceRegistryPageCurrentInterface;
    unitTest: UnitTest;

    getPageLevelMixins() {
      return [MixinModals];
    }

    mounted() {
      this.unitTest = new UnitTest();

      this.el
        .querySelector('.open-another-modal')
        .addEventListener('click', () => {
          this.services.modals.get('/demo/loading/fetch/simple');
        });
    }
  },
};

export default bundle;
