import UnitTest from '../../../../class/UnitTest';

export default class VariablesTest extends UnitTest {
  public getTestMethods() {
    return []
  }

  public testVariables() {
    this.assertEquals(
      this.app.layout.vars.demoVariableLayout,
      'demoVariableLayoutValue',
      'Variable has proper value'
    );

    this.assertEquals(
      this.app.layout.page.vars.demoVariable,
      'demoVariableValue',
      'Variable has proper value'
    );

    this.assertTrue(
      typeof this.app.layout.page.vars.demoVariableBoolean === 'boolean',
      'Variable has proper boolean value'
    );

    this.assertTrue(
      typeof this.app.layout.page.vars.demoVariableInteger === 'number',
      'Variable int has proper number value'
    );

    this.assertTrue(
      typeof this.app.layout.page.vars.demoVariableFloat === 'number',
      'Variable float has proper number value'
    );

    this.assertTrue(
      typeof this.app.layout.page.vars.demoVariableObject === 'object',
      'Variable object has proper number value'
    );
  }
}