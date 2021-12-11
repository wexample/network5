import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import UnitTest from '../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest';
import AssetBundleInterface from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface';
import ModalsService from '../../../../src/Wex/BaseBundle/Resources/js/services/Modals';
import { ServiceRegistryPageInterface } from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/ServiceRegistryPageInterface';
import AppService from '../../../../src/Wex/BaseBundle/Resources/js/class/AppService';

interface ServiceRegistryPageCurrentInterface
  extends ServiceRegistryPageInterface {
  modals: ModalsService;
}

const bundle: AssetBundleInterface = {
  bundleGroup: 'page',

  definition: class extends Page {
    services: ServiceRegistryPageCurrentInterface;
    unitTest: UnitTest;

    getPageLevelMixins(): typeof AppService[] {
      return [ModalsService];
    }

    mounted() {
      this.unitTest = new UnitTest();

      this.el
        .querySelector('#page-overlay-show')
        .addEventListener('click', () => {
          this.loadingStart();

          setTimeout(() => {
            this.loadingStop();
          }, 1000);
        });

      this.el
        .querySelector('#page-modal-show')
        .addEventListener('click', () => {
          this.services.modals.get('/demo/loading/fetch/simple');
        });
    }
  },
};

export default bundle;
