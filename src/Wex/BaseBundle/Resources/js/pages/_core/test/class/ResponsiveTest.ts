import UnitTest from '../../../../class/UnitTest';
import { sleep } from "../../../../helpers/Time";
import { appendInnerHtml } from "../../../../helpers/Dom";

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

    let elPlayground = this.app.layout.pageFocused.el.querySelector('#test-playground') as HTMLElement;

    await this.assertResponsiveWorks(
      document.body,
      elPlayground
    );

    elPlayground.innerHTML = '<div class="responsive-test-child"></div>';

    await this.assertResponsiveWorks(
      elPlayground,
      elPlayground.querySelector('.responsive-test-child')
    );
  }

  async assertResponsiveWorks(
    elResponsive: HTMLElement,
    elPlayground: HTMLElement
  ) {
    let elTester = this.generateResponsiveTester(elPlayground);

    await sleep();

    this.assertPlaygroundResponsiveEquals(
      this.app.services.responsive.responsiveSizeCurrent,
      elPlayground
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
        elPlayground
      );
    }

    elTester.remove();
  }

  assertPlaygroundResponsiveEquals(size: string, elPlayground: HTMLElement) {
    this.assertEquals(getComputedStyle(
        elPlayground.querySelector(`.test-responsive-${size}`)
      ).backgroundColor,
      'rgb(0, 128, 0)',
      `The test zone ${size} is green`
    );
  }

  generateResponsiveTester(elPlayground: HTMLElement): HTMLElement {
    let html = '<div class="responsive-tester">';
    let breakPoints = Object.keys(this.app.layout.vars.displayBreakpoints);

    for (let size of breakPoints) {
      html += `<div class="test-responsive test-responsive-${size}">${size}</div>`
    }

    html += '</div>';

    appendInnerHtml(elPlayground, html);

    return elPlayground.querySelector('.responsive-tester');
  }
}