import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import UnitTest from '../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest';
import AssetBundleInterface from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface';
import {
  MixinModals,
  ModalsService,
} from '../../../../src/Wex/BaseBundle/Resources/js/mixins/Modals';
import { ServiceRegistryPageInterface } from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/ServiceRegistryPageInterface';
import { traceRenderNodes as debugTraceRenderNodes } from '../../../../src/Wex/BaseBundle/Resources/js/helpers/Debug';
import { MixinDebug } from '../../../../src/Wex/BaseBundle/Resources/js/mixins/Debug';

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
      return [MixinModals, MixinDebug];
    }

    ready() {
      this.unitTest = new UnitTest();

      this.el
        .querySelector('#page-overlay-show')
        .addEventListener('click', () => {
          this.loadingStart();

          setTimeout(() => {
            this.loadingStop();
          }, 1000);
        });

      debugTraceRenderNodes(this.app.layout);

      this.el
        .querySelector('#page-modal-show')
        .addEventListener('click', () => {
          this.services.modals
            .get('/demo/loading/fetch/simple')
            .then(() => {
              debugTraceRenderNodes(this.app.layout);
            });
        });
    }
  },
};

export default bundle;
