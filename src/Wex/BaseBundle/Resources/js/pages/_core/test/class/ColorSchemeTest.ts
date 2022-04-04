import UnitTest from '../../../../class/UnitTest';
import ColorSchemeService from "../../../../services/ColorSchemeService";
import { sleep } from "../../../../helpers/Time";
import { CssColorName, CssStyleValue } from "../../../../helpers/CssHelper";

export default class ColorSchemeTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testAllColorScheme,
      this.testDarkColorScheme,
      this.testNestedColorSchemes,
    ];
  }

  public async testAllColorScheme() {
    this.assertEquals(
      this.app.services.colorScheme.getColorScheme(),
      ColorSchemeService.COLOR_SCHEME_DEFAULT,
      'Default color scheme is detected by service'
    );

    this.checkColorScheme(
      ColorSchemeService.COLOR_SCHEME_DEFAULT
    );

    for (let name of ColorSchemeService.COLOR_SCHEMES) {
      await this.app.layout.colorSchemeSet(
        name
      );

      this.checkColorScheme(
        name
      );
    }
  }

  public async testNestedColorSchemes() {
    const elZoneOne = document.getElementById('test-color-scheme-zone-one');
    const elZoneTwo = document.getElementById('test-color-scheme-zone-two');
    const elZoneThree = document.getElementById('test-color-scheme-zone-three');
    const elZoneFour = document.getElementById('test-color-scheme-zone-four');

    this.assertCssStyleHasColor(
      elZoneOne,
      CssStyleValue.BACKGROUND_COLOR,
      CssColorName.WHITE,
      'The default color zone'
    );

    this.assertCssStyleHasColor(
      elZoneTwo,
      CssStyleValue.BACKGROUND_COLOR,
      CssColorName.BLACK,
      'The second color scheme zone'
    );

    this.assertCssStyleHasColor(
      elZoneThree,
      CssStyleValue.BACKGROUND_COLOR,
      CssColorName.WHITE,
      'The third color scheme zone'
    );

    this.assertCssStyleHasColor(
      elZoneFour,
      CssStyleValue.BACKGROUND_COLOR,
      CssColorName.BLACK,
      'The fourth color scheme zone'
    );
  }

  public async testDarkColorScheme() {
    await this.app.layout.colorSchemeSet(ColorSchemeService.COLOR_SCHEME_DARK);

    // Wait for events to be triggered, and CSS loaded.
    await sleep(100);

    this.assertCssStyleHasColor(
      this.app.layout.pageFocused.el,
      CssStyleValue.BACKGROUND_COLOR,
      CssColorName.BLACK,
      'Dark mode background'
    );

    this.app.layout.colorSchemeSet(ColorSchemeService.COLOR_SCHEME_DEFAULT);

    // No need to sleep here.

    this.assertEquals(
      getComputedStyle(this.app.layout.pageFocused.el).backgroundColor,
      'rgba(0, 0, 0, 0)',
      'Default color scheme mode background is transparent'
    )
  }

  private checkColorScheme(name: string) {
    this.assertEquals(
      this.app.layout.colorSchemeActive,
      name,
      'Default color scheme is selected by default'
    );

    let className = `color-scheme-${name}`;

    this.assertTrue(
      this.app.layout.el.classList.contains(className),
      `Class is set ${className}`
    );
  }
}
