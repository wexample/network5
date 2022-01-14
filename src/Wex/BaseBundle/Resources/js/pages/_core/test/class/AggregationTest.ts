import UnitTest from '../../../../class/UnitTest';

export default class AggregationTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testDefault,
    ];
  }

  private testDefault(path: string, testString: string) {
    let enableAggregation = this.app.layout.vars.enableAggregation;

    this.assertEquals(
      /\.agg\.[a-z\?0-9]*"/.test(document.documentElement.innerHTML),
      enableAggregation,
      `The aggregation mode is ${enableAggregation}, .agg files are present according to it.`
    );

    if (enableAggregation) {
      this.assertEquals(
        document.head.querySelectorAll('link[rel=preload]').length,
        2,
        `There is only two preloaded items when aggregation is on (js, css)`
      );

      // Js count

      // + Layout loading class remover
      // + page.agg.js
      // + Layout render data
      this.assertEquals(
        document.body.querySelectorAll('script').length,
        3,
        `Count of JS files in body matches`
      );

      // + Layout registry
      // + page-m.js
      this.assertEquals(
        document.head.querySelectorAll('script').length,
        2,
        `Count of JS files in head matches`
      );

      // CSS Count

      // + page.agg.css
      this.assertEquals(
        document.body.querySelectorAll('link[rel=stylesheet]').length,
        1,
        `Count of CSS files in body matches`
      );

      // + page-m.js
      // + test-component.js
      this.assertEquals(
        document.head.querySelectorAll('link[rel=stylesheet]').length,
        2,
        `Count of CSS files in head matches`
      );



    } else {
      this.assertTrue(
        document.head.querySelectorAll('link[rel=preload]').length > 2,
        `There is more than two preloaded items when aggregation is off (around one per render node)`
      );
    }
  }
}
