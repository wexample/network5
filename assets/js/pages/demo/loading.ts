import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import ModalsService from '../../../../src/Wex/BaseBundle/Resources/js/services/ModalsService';
import AppService from '../../../../src/Wex/BaseBundle/Resources/js/class/AppService';
import AppInterface from "../../../../src/Wex/BaseBundle/Resources/js/interfaces/ServicesRegistryInterface";

export default class extends Page {
  services: AppInterface;

  getPageLevelMixins(): typeof AppService[] {
    return [ModalsService];
  }

  async mounted() {
    this.el
      .querySelector('#page-overlay-show')
      .addEventListener('click', () => {
        this.loadingStart();

        setTimeout(() => {
          this.loadingStop();
        }, 1000);
      });

    this.el.querySelector('#page-modal-show').addEventListener('click', () => {
      this.services.modals.get('/demo/loading/fetch/simple');
    });
  }
}
