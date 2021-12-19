import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import UnitTest from '../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest';
import ModalsService from '../../../../src/Wex/BaseBundle/Resources/js/services/Modals';
import { ServiceRegistryPageInterface } from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/ServiceRegistryPageInterface';
import AppService from '../../../../src/Wex/BaseBundle/Resources/js/class/AppService';

interface ServiceRegistryPageCurrentInterface
  extends ServiceRegistryPageInterface {
  modals: ModalsService;
}

export default class extends Page {
  services: ServiceRegistryPageCurrentInterface;
  unitTest: UnitTest;

  getPageLevelMixins(): typeof AppService[] {
    return [ModalsService];
  }

  mounted() {
    this.unitTest = new UnitTest();

    this.el
      .querySelector('.open-another-modal')
      .addEventListener('click', () => {
        this.services.modals.get('/demo/loading/fetch/simple');
      });
  }
}
