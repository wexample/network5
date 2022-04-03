import AggregationTest from './class/AggregationTest';
import AdaptiveRenderingTest from './class/AdaptiveRenderingTest';
import TestManagerPage from '../../../class/TestManagerPage';
import TranslationTest from './class/TranslationTest';
import TestTest from './class/TestTest';
import AppTest from './class/AppTest';
import ResponsiveTest from './class/ResponsiveTest';
import VariablesTest from './class/VariablesTest';
import NoJsTest from "./class/NoJsTest";
import ColorSchemeTest from "./class/ColorSchemeTest";
import ColorSchemeService from "../../../services/ColorSchemeService";

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
      ColorSchemeTest,
      NoJsTest,
      ResponsiveTest,
      TestTest,
      TranslationTest,
      VariablesTest,
    });

    let location = document.location;

    // Run test without aggregation.
    if (this.app.layout.vars.enableAggregation) {
      location.replace(
        `${location.origin}${location.pathname}?no-aggregation=1`
      );

      return;
    }

    // Enforce dark mode.
    if (this.app.layout.vars.colorScheme === ColorSchemeService.COLOR_SCHEME_DEFAULT) {
      location.replace(
        `${location.origin}${location.pathname}?no-aggregation=1&color-scheme=${ColorSchemeService.COLOR_SCHEME_DARK}`
      );

      return;
    }
  }
}
