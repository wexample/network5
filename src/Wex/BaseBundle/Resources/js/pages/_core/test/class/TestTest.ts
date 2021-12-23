import UnitTest from '../../../../class/UnitTest';

export default class TestTest extends UnitTest {
  public getTestMethods() {
    return [this.testAsserts];
  }

  public testAsserts() {
    this.assertTrue(true, 'Assert true works');

    this.assertFalse(false, 'Assert false works');

    this.assertEquals('A', 'A', 'Assert equals works');
  }
}
