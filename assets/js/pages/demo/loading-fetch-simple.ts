import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import ModalsService from '../../../../src/Wex/BaseBundle/Resources/js/services/ModalsService';
import { PageInterface } from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/ServiceRegistry/PageInterface';
import AppService from '../../../../src/Wex/BaseBundle/Resources/js/class/AppService';

interface ServiceRegistryPageCurrentInterface extends PageInterface {
  modals: ModalsService;
}

export default class extends Page {
  services: ServiceRegistryPageCurrentInterface;

  getPageLevelMixins(): typeof AppService[] {
    return [ModalsService];
  }

  mounted() {
    this.el
      .querySelector('.open-another-modal')
      .addEventListener('click', () => {
        this.services.modals.get('/demo/loading/fetch/simple');
      });
  }
}
