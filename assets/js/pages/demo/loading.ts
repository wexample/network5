import { MDCRipple } from '@material/ripple/index';
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

    init() {
      this.unitTest = new UnitTest();
      // TODO cleanup
      document.querySelectorAll('.button').forEach((el) => new MDCRipple(el));

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
          let modalsService = this.services.modals;

          modalsService
            .get('/demo/loading/fetch/simple', {})
            .then((response: Response) => {
              return response.text();
            })
            .then((body) => {
              console.log(body);
            });
        });
    }
  },
};

export default bundle;
