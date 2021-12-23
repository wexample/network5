import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import Events from '../../../../src/Wex/BaseBundle/Resources/js/helpers/Events';

export default class extends Page {
  async mounted() {
    document
      .querySelectorAll('.demo-button-switch-color-scheme')
      .forEach((el) => {
        el.addEventListener(Events.CLICK, async () => {
          await this.services.colorScheme.setColorScheme(
            el.getAttribute('data-color-scheme'),
            true
          );
        });
      });
  }

  updateCurrentResponsiveDisplay() {
    super.updateCurrentResponsiveDisplay();

    let responsiveMixin = this.services.responsive;
    let current = responsiveMixin.responsiveSizeCurrent;

    document
      .querySelectorAll('.display-breakpoint')
      .forEach((el) => el.classList.remove('display-breakpoint-current'));

    document
      .querySelector(`.display-breakpoint-${current}`)
      .classList.add('display-breakpoint-current');
  }
}
