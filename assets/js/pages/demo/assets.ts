import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import Events from '../../../../src/Wex/BaseBundle/Resources/js/helpers/Events';

export default class extends Page {
  async pageReady() {
    document
      .querySelectorAll('.demo-button-switch-color-scheme')
      .forEach((el) => {
        el.addEventListener(Events.CLICK, async () => {
          await this.app.layout.colorSchemeSet(
            el.getAttribute('data-color-scheme'),
            true
          );
        });
      });
  }

  updateCurrentResponsiveDisplay() {
    super.updateCurrentResponsiveDisplay();

    let current = this.app.layout.responsiveSizeCurrent;

    document
      .querySelectorAll('.display-breakpoint')
      .forEach((el) => el.classList.remove('display-breakpoint-current'));

    document
      .querySelector(`.display-breakpoint-${current}`)
      .classList.add('display-breakpoint-current');
  }
}
