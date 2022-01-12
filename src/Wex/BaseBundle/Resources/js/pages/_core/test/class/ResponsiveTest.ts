import UnitTest from '../../../../class/UnitTest';
import { sleep } from '../../../../helpers/Time';
import { appendInnerHtml } from '../../../../helpers/Dom';
import RenderNode from "../../../../class/RenderNode";

export default class ResponsiveTest extends UnitTest {
  cssActivationWait: number = 20;

  public getTestMethods() {
    return [
      this.testDefault,
      this.testModale,
    ];
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

    await this.assertResponsiveSwitchWorks(
      this.app.layout,
      '#test-playground',
      this.app.layout.page.findChildRenderNodeByName('components/test-component'),
      'background-color',
      'rgb(0, 128, 0)',
    );
  }

  async assertResponsiveSwitchWorks(
    mainRenderNode: RenderNode,
    mainPlaygroundSelector: string,
    component: Component,
    mainResponsiveStyle: string,
    mainResponsiveColor: string,
  ) {
    let elPlayground = mainRenderNode.el.querySelector(mainPlaygroundSelector) as HTMLElement;
    let breakPoints = Object.keys(this.app.layout.vars.displayBreakpoints);
    let elTesterLayout = this.generateResponsiveTester(elPlayground);
    let elTesterComponent = this.generateResponsiveTester(component.el);

    for (let layoutResponsiveSize of breakPoints) {
      mainRenderNode.responsiveSet(layoutResponsiveSize, true);

      await sleep(this.cssActivationWait);

      this.assertMainResponsiveApplyStyle(
        layoutResponsiveSize,
        elTesterLayout,
        mainResponsiveStyle,
        mainResponsiveColor,
      );

      // Test component responsive.
      for (let componentResponsiveSize of breakPoints) {
        component.responsiveSet(componentResponsiveSize);

        await sleep(this.cssActivationWait);

        this.assertMainResponsiveApplyStyle(
          componentResponsiveSize,
          elTesterComponent,
          mainResponsiveStyle,
          mainResponsiveColor,
          // Only active if same of main layout
          componentResponsiveSize !== layoutResponsiveSize
        );

        this.assertResponsiveTestZoneHaveStyle(
          componentResponsiveSize,
          elTesterComponent,
          'color',
          'rgb(0, 255, 0)',
        );
      }
    }

    elTesterLayout.remove();
    elTesterComponent.remove();
  }

  async testModale() {
    return await this.app.services.pages
      .get(
        this.app.services.routing.path('_core_test_adaptive')
      )
      .then(async () => {
        let elPlayground = this.app.layout.el.querySelector('#test-playground');
        let elTesterLayout = this.generateResponsiveTester(elPlayground);
        let breakPoints = Object.keys(this.app.layout.vars.displayBreakpoints);

        for (let responsiveSize of breakPoints) {
          // TODO Merge
          this.app.layout.responsiveSet(responsiveSize);
          this.app.layout.page.responsiveSet(responsiveSize);

          await sleep(this.cssActivationWait);

          this.assertMainResponsiveApplyStyle(
            responsiveSize,
            elTesterLayout,
            'background-color',
            'rgb(0, 128, 0)',
          );

          await this.assertResponsiveSwitchWorks(
            this.app.layout.pageFocused,
            '.adaptive-page-playground',
            this.app.layout.pageFocused.findChildRenderNodeByName('components/test-component'),
            'border-color',
            'rgb(0, 255, 0)'
          );
        }

        elTesterLayout.remove();
      });
  }

  assertTestZoneHaveStyle(
    elTestZoneName: string,
    elTestZone: HTMLElement,
    property: string,
    expectedColorValue: string
  ) {
    this.assertEquals(
      getComputedStyle(elTestZone)[property],
      expectedColorValue,
      `The test zone ${elTestZoneName} has value ${expectedColorValue}`
    );
  }

  assertResponsiveTestZoneHaveStyle(
    elTestZoneSize: string,
    elPlayground: HTMLElement,
    property: string,
    expectedColorValue: string
  ) {
    this.assertTestZoneHaveStyle(
      elTestZoneSize,
      elPlayground.querySelector(`.test-responsive-${elTestZoneSize}`),
      property,
      expectedColorValue
    );
  }

  assertMainResponsiveApplyStyle(
    size: string,
    elPlayground: HTMLElement,
    activeStyle: string,
    activeColor: string,
    reverse: boolean = false
  ) {
    let expectedColorValue = activeColor;

    if (reverse) {
      expectedColorValue = 'rgb(102, 102, 102)';
    }

    this.assertResponsiveTestZoneHaveStyle(
      size,
      elPlayground,
      activeStyle,
      expectedColorValue
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
