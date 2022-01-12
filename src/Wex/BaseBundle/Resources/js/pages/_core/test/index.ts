import AdaptiveRenderingTest from './class/AdaptiveRenderingTest';
import TestManagerPage from '../../../class/TestManagerPage';
import PageTest from './class/PageTest';
import TestTest from './class/TestTest';
import AppTest from './class/AppTest';
import ResponsiveTest from './class/ResponsiveTest';
import VariablesTest from "./class/VariablesTest";

export default class extends TestManagerPage {
  async pageReady() {
    // TODO Test no js
    // TODO Test no aggregation
    // TODO Test icons
    // TODO Test color schemes
    // TODO Test modal in modal
    // TODO Test js helpers
    // TODO Test translations (layout / page / com / modal)
    // TODO Test overlays (multiple / inside a modal ?)

    await this.runTests({
      AdaptiveRenderingTest,
      AppTest,
      PageTest,
      ResponsiveTest,
      TestTest,
      VariablesTest
    });
  }
}
