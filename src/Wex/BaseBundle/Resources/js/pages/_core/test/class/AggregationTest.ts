import UnitTest from '../../../../class/UnitTest';

export default class AggregationTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testDefault,
    ];
  }

  private testDefault(path: string, testString: string) {
    let mode = this.app.layout.vars.enableAggregation;

    this.assertEquals(
      /\.agg\.[a-z\?0-9]*"/.test(document.documentElement.innerHTML),
      mode,
      `The aggregation mode is ${mode}, .agg files are present according to it.`
    );
  }
}
