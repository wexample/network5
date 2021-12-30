import UnitTest from '../../../../class/UnitTest';
import RenderNode from "../../../../class/RenderNode";
import { sleep } from "../../../../helpers/Time";

export default class ResponsiveTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testDefault,
    ];
  }

  async testDefault() {
    this.assertTrue(
      document.body.classList.contains(`responsive-${this.app.services.responsive.responsiveSizeCurrent}`),
      'The default responsive size has been applied to layout body'
    )

    this.generatePlayground();

    await sleep();

    this.assertPlaygroundResponsiveEquals(
      this.app.services.responsive.responsiveSizeCurrent,
      this.app.layout.page
    )

    let breakPoints = Object.keys(this.app.layout.vars.displayBreakpoints);

    for (let size of breakPoints) {
      await this.app.services.responsive.setResponsive(
        size,
        true
      );

      await sleep(100);

      this.assertPlaygroundResponsiveEquals(
        size,
        this.app.layout.page
      );
    }
  }

  assertPlaygroundResponsiveEquals(size: string, page: RenderNode) {
    this.assertEquals(getComputedStyle(
        page.el.querySelector(`.test-responsive-${size}`)
      ).backgroundColor,
      'rgb(0, 128, 0)',
      `The test zone ${size} is green`
    );
  }

  generatePlayground() {
    let html = '';
    let breakPoints = Object.keys(this.app.layout.vars.displayBreakpoints);

    for (let size of breakPoints) {
      html += `<div class="test-responsive test-responsive-${size}">${size}</div>`
    }

    this.app.layout.pageFocused.el.querySelector('#test-playground').innerHTML = html;
  }
}
