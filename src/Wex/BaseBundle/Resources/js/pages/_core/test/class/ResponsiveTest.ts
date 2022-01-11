import UnitTest from '../../../../class/UnitTest';
import { sleep } from '../../../../helpers/Time';
import { appendInnerHtml } from '../../../../helpers/Dom';

export default class ResponsiveTest extends UnitTest {
  public getTestMethods() {
    return [this.testDefault];
  }

  async testDefault() {
    this.assertTrue(
      document
        .getElementById('layout')
        .classList.contains(
        `responsive-${this.app.layout.responsiveSizeCurrent}`
      ),
      `The default responsive size of "responsive-${this.app.layout.responsiveSizeCurrent}" has been applied to layout body`
    );

    let elPlayground = this.app.layout.pageFocused.el.querySelector(
      '#test-playground'
    ) as HTMLElement;

    let breakPoints = Object.keys(this.app.layout.vars.displayBreakpoints);
    let elTesterLayout = this.generateResponsiveTester(elPlayground);
    let component = this.app.layout.page.findChildRenderNodeByName('components/test-component');
    let elTesterComponent = this.generateResponsiveTester(component.el);

    for (let layoutResponsiveSize of breakPoints) {
      this.app.layout.responsiveSet(layoutResponsiveSize, true);

      await sleep(100);

      this.assertLayoutResponsiveApplyStyle(layoutResponsiveSize, elTesterLayout);

      // Test component responsive.
      for (let componentResponsiveSize of breakPoints) {
        this.assertLayoutResponsiveApplyStyle(
          componentResponsiveSize,
          elTesterComponent,
          // Only the
          componentResponsiveSize !== layoutResponsiveSize
        );
      }
    }

    elTesterLayout.remove();
    elTesterComponent.remove();
  }

  assertLayoutResponsiveApplyStyle(
    size: string,
    elPlayground: HTMLElement,
    reverse: boolean = false
  ) {
    let expectedColorValue = 'rgb(0, 128, 0)';
    let expectedColorName = 'green';

    if (reverse) {
      expectedColorValue = 'rgb(102, 102, 102)';
      expectedColorName = 'gray';
    }

    this.assertEquals(
      getComputedStyle(elPlayground.querySelector(`.test-responsive-${size}`))
        .backgroundColor,
      expectedColorValue,
      `The test zone ${size} is ${expectedColorName}`
    );
  }

  generateResponsiveTester(elPlayground: HTMLElement): HTMLElement {
    let html = '<div class="responsive-tester">';
    let breakPoints = Object.keys(this.app.layout.vars.displayBreakpoints);

    for (let size of breakPoints) {
      html += `<div class="test-responsive test-responsive-${size}">${size}</div>`;
    }

    html += '</div>';

    appendInnerHtml(elPlayground, html);

    return elPlayground.querySelector('.responsive-tester');
  }
}
