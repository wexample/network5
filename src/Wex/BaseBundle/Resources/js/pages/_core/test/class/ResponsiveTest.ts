import UnitTest from '../../../../class/UnitTest';
import { sleep } from '../../../../helpers/Time';
import { appendInnerHtml } from '../../../../helpers/DomHelper';
import RenderNode from '../../../../class/RenderNode';
import Component from '../../../../class/Component';

export default class ResponsiveTest extends UnitTest {
  responsiveActivationWaitDuration: number = 20;
  responsiveSizes: string[];

  public getTestMethods() {
    return [this.testDefault, this.testModale, this.testDisplays];
  }

  public init() {
    this.responsiveSizes = Object.keys(this.app.layout.vars.displayBreakpoints);
  }

  resetPageResponsiveSizesCounters() {
    this.app.layout.page.vars.responsiveSizesCounters = {};
    this.responsiveSizes.forEach((size: string) => {
      this.app.layout.page.vars.responsiveSizesCounters[size] = 0;
    });
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
      this.app.layout.page.findChildRenderNodeByName(
        'components/test-component'
      ) as Component,
      'background-color',
      'rgb(0, 128, 0)'
    );
  }

  async assertResponsiveSwitchWorks(
    mainRenderNode: RenderNode,
    mainPlaygroundSelector: string,
    component: Component,
    mainResponsiveStyle: string,
    mainResponsiveColor: string
  ) {
    let elPlayground = mainRenderNode.el.querySelector(
      mainPlaygroundSelector
    ) as HTMLElement;
    let breakPoints = this.responsiveSizes;
    let elTesterLayout = this.generateResponsiveTester(elPlayground);
    let elTesterComponent = this.generateResponsiveTester(component.el);

    for (let layoutResponsiveSize of breakPoints) {
      mainRenderNode.responsiveSet(layoutResponsiveSize, true);

      await sleep(this.responsiveActivationWaitDuration);

      this.assertMainResponsiveApplyStyle(
        layoutResponsiveSize,
        elTesterLayout,
        mainResponsiveStyle,
        mainResponsiveColor
      );

      // Test component responsive.
      for (let componentResponsiveSize of breakPoints) {
        component.responsiveSet(componentResponsiveSize);

        await sleep(this.responsiveActivationWaitDuration);

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
          'rgb(0, 255, 0)'
        );
      }
    }

    elTesterLayout.remove();
    elTesterComponent.remove();
  }

  async testModale() {
    return await this.app.services.pages
      .get(this.app.services.routing.path('_core_test_adaptive'))
      .then(async () => {
        let elPlayground = this.app.layout.el.querySelector(
          '#test-playground'
        ) as HTMLElement;
        let elTesterLayout = this.generateResponsiveTester(elPlayground);
        let breakPoints = this.responsiveSizes;

        for (let responsiveSize of breakPoints) {
          this.app.layout.responsiveSet(responsiveSize, true);

          await sleep(this.responsiveActivationWaitDuration);

          this.assertMainResponsiveApplyStyle(
            responsiveSize,
            elTesterLayout,
            'background-color',
            'rgb(0, 128, 0)'
          );

          await this.assertResponsiveSwitchWorks(
            this.app.layout.pageFocused,
            '.adaptive-page-playground',
            this.app.layout.pageFocused.findChildRenderNodeByName(
              'components/test-component'
            ) as Component,
            'border-color',
            'rgb(0, 255, 0)'
          );
        }

        elTesterLayout.remove();
      });
  }

  async testDisplays() {
    let breakPoints = this.responsiveSizes;

    this.resetPageResponsiveSizesCounters();
    this.app.layout.page.vars.responsiveSizesCounters[
      this.app.layout.page.responsiveSizeCurrent
    ]++;

    for (let responsiveSize of breakPoints) {
      await this.app.layout.responsiveSet(responsiveSize, true);

      this.assertEquals(
        this.app.layout.page.vars.responsiveSizesCounters[responsiveSize],
        1,
        `Size ${responsiveSize} display set 1`
      );

      await sleep(this.responsiveActivationWaitDuration * 10);
    }
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
    let breakPoints = this.responsiveSizes;

    for (let size of breakPoints) {
      html += `<div class="test-responsive test-responsive-${size}">${size}</div>`;
    }

    html += '</div>';

    appendInnerHtml(elPlayground, html);

    return elPlayground.querySelector('.responsive-tester');
  }
}
