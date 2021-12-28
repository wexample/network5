import UnitTest from '../../../../class/UnitTest';

export default class PageTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testDefault
    ];
  }

  public testDefault() {
    this.assertEquals(
      this.app.layout.page.vars.initialPageVar,
      true,
      'Initial page var is set'
    );

    this.assertEquals(
      this.app.layout.vars.initialLayoutVar,
      true,
      'Initial layout var is set'
    );
  }
}
