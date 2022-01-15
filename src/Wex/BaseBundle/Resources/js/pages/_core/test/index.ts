import AggregationTest from './class/AggregationTest';
import AdaptiveRenderingTest from './class/AdaptiveRenderingTest';
import TestManagerPage from '../../../class/TestManagerPage';
import TranslationTest from './class/TranslationTest';
import TestTest from './class/TestTest';
import AppTest from './class/AppTest';
import ResponsiveTest from './class/ResponsiveTest';
import VariablesTest from './class/VariablesTest';
import NoJsTest from "./class/NoJsTest";

export default class extends TestManagerPage {
  async pageReady() {
    // TODO Test icons
    // TODO Test color schemes
    // TODO Test modal in modal
    // TODO Test js helpers
    // TODO Test overlays (multiple / inside a modal ?)

    await this.runTests({
      AggregationTest,
      AdaptiveRenderingTest,
      AppTest,
      NoJsTest,
      ResponsiveTest,
      TestTest,
      TranslationTest,
      VariablesTest,
    });

    // Run test without aggregation.
    if (this.app.layout.vars.enableAggregation) {
      document.location.replace(
        `${document.location.origin}${document.location.pathname}?no-aggregation=1`
      );
    }
  }
}
