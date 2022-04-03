import UnitTest from '../../../../class/UnitTest';
import ColorSchemeService from "../../../../services/ColorSchemeService";
import { sleep } from "../../../../helpers/Time";

export default class ColorSchemeTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testAllColorScheme,
      this.testDarkColorScheme,
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

  public async testDarkColorScheme() {
    await this.app.layout.colorSchemeSet(ColorSchemeService.COLOR_SCHEME_DARK);

    // Wait for events to be triggered, and CSS loaded.
    await sleep(100);

    this.assertEquals(
      getComputedStyle(this.app.layout.pageFocused.el).backgroundColor,
      'rgb(0, 0, 0)',
      'Dark mode background is black'
    )

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
