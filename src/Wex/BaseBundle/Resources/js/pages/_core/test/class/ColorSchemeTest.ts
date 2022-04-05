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
    const mapDefault = {
      'one': CssColorName.WHITE,
      'two': CssColorName.BLACK,
      'three': CssColorName.WHITE,
      'four': CssColorName.BLACK,
      'five': CssColorName.WHITE,
    };

    this.assertColorSchemesMapMatches(mapDefault);

    // Switch black.

    await this.app.layout.colorSchemeSet(ColorSchemeService.COLOR_SCHEME_DARK);
    this.assertColorSchemesMapMatches({
      'one': CssColorName.BLACK,
      'two': CssColorName.BLACK,
      'three': CssColorName.BLACK,
      'four': CssColorName.BLACK,
      'five': CssColorName.BLACK,
    });

    // Switch white.

    await this.app.layout.colorSchemeSet(ColorSchemeService.COLOR_SCHEME_LIGHT);
    this.assertColorSchemesMapMatches({
      'one': CssColorName.WHITE,
      'two': CssColorName.WHITE,
      'three': CssColorName.WHITE,
      'four': CssColorName.WHITE,
      'five': CssColorName.WHITE,
    });

    // Switch back default.

    await this.app.layout.colorSchemeSet(ColorSchemeService.COLOR_SCHEME_DEFAULT);
    this.assertColorSchemesMapMatches(mapDefault);
  }

  protected assertColorSchemesMapMatches(map) {
    for (const name in map) {
      const color = map[name];
      const elZone = document.getElementById(`test-color-scheme-zone-${name}`);

      this.assertCssStyleHasColor(
        elZone,
        CssStyleValue.BACKGROUND_COLOR,
        color,
        `The default color zone number ${name}`
      );
    }
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

    this.assertCssStyleHasColor(
      this.app.layout.pageFocused.el,
      CssStyleValue.BACKGROUND_COLOR,
      CssColorName.WHITE,
      'Default color scheme mode background'
    );
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
