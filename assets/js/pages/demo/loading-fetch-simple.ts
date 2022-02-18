import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import ModalsService from '../../../../src/Wex/BaseBundle/Resources/js/services/ModalsService';
import AppService from '../../../../src/Wex/BaseBundle/Resources/js/class/AppService';
import ServicesRegistryInterface from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/ServicesRegistryInterface';

export default class extends Page {
  services: ServicesRegistryInterface;

  getPageLevelMixins(): typeof AppService[] {
    return [ModalsService];
  }

  async pageReady() {
    this.el
      .querySelector('.open-another-modal')
      .addEventListener('click', () => {
        this.services.modals.get('/demo/loading/fetch/simple');
      });
  }
}
