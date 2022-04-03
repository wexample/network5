import UnitTest from '../../../../class/UnitTest';
import ColorSchemeService from "../../../../services/ColorSchemeService";

export default class ColorSchemeTest extends UnitTest {
  public getTestMethods() {
    return [this.testColorScheme];
  }

  public testColorScheme() {
    this.assertEquals(
      this.app.services.colorScheme.getColorScheme(),
      ColorSchemeService.COLOR_SCHEME_DEFAULT,
      'Default color scheme is detected by service'
    );

    this.checkColorScheme(
      ColorSchemeService.COLOR_SCHEME_DEFAULT
    );

    ColorSchemeService.COLOR_SCHEMES.forEach((name: string) => {
      this.app.layout.colorSchemeSet(
        name
      );

      this.checkColorScheme(
        name
      );
    });
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
