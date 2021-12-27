import AdaptiveRenderingTest from './class/AdaptiveRenderingTest';
import TestManagerPage from '../../../class/TestManagerPage';
import TestTest from './class/TestTest';
import AppTest from './class/AppTest';

export default class extends TestManagerPage {
  tests: any;

  async mounted() {
    // TODO Test no js
    // TODO Test no aggregation
    // TODO Test icons
    // TODO Test vue
    // TODO Test component
    // TODO Test component in vue
    // TODO Test responsive (and js responsive displays)
    // TODO Test color schemes
    // TODO Test modal
    // TODO Test modal in modal
    // TODO Test js helpers
    // TODO Test variables (layout / page / com / modal)
    // TODO Test translations (layout / page / com / modal)
    // TODO Test overlays (multiple / inside a modal ?)

    await this.runTests({
      AdaptiveRenderingTest,
      AppTest,
      TestTest,
      // TODO VariablesTest
    });
  }
}
