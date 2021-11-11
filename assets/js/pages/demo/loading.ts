import {MDCRipple} from '@material/ripple/index';
import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import UnitTest from '../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest';
import AssetBundleInterface from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface';
import MixinModals from '../../../../src/Wex/BaseBundle/Resources/js/mixins/Modals';

const bundle: AssetBundleInterface = {
  bundleGroup: 'page',

  definition: class extends Page {
    unitTest: UnitTest;

    getPageLevelMixins() {
      return [
        MixinModals
      ];
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
          let modalsService = this.app.getService('modals');

          modalsService.open();
        });
    }
  },
};

export default bundle;
