import Page from '../../../../src/Wex/BaseBundle/Resources/js/class/Page';
import UnitTest from '../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest';
import { PageInterface } from '../../../../src/Wex/BaseBundle/Resources/js/interfaces/ServiceRegistry/PageInterface';
import Events from '../../../../src/Wex/BaseBundle/Resources/js/helpers/Events';

interface ServiceRegistryPageCurrentInterface
  extends PageInterface {}

export default class extends Page {
  services: ServiceRegistryPageCurrentInterface;
  unitTest: UnitTest;

  async mounted() {
    this.unitTest = new UnitTest();

    await this.testVariables();

    document.querySelectorAll('.demo-button-switch-theme').forEach((el) => {
      el.addEventListener(Events.CLICK, async () => {
        await this.services.theme.setTheme(el.getAttribute('data-theme'), true);
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

  updateLayoutTheme(theme) {
    super.updateLayoutTheme(theme);
  }

  testVariables() {
    let test = this.unitTest;

    test.assertEquals(
      this.app.layout.vars.demoVariableLayout,
      'demoVariableLayoutValue',
      'Variable has proper value'
    );

    test.assertEquals(
      this.app.layout.page.vars.demoVariable,
      'demoVariableValue',
      'Variable has proper value'
    );

    test.assertTrue(
      typeof this.app.layout.page.vars.demoVariableBoolean === 'boolean',
      'Variable has proper boolean value'
    );

    test.assertTrue(
      typeof this.app.layout.page.vars.demoVariableInteger === 'number',
      'Variable int has proper number value'
    );

    test.assertTrue(
      typeof this.app.layout.page.vars.demoVariableFloat === 'number',
      'Variable float has proper number value'
    );

    test.assertTrue(
      typeof this.app.layout.page.vars.demoVariableObject === 'object',
      'Variable object has proper number value'
    );
  }
}
