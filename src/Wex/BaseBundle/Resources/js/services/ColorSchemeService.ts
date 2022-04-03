import MixinsAppService from '../class/MixinsAppService';
import AppService from '../class/AppService';
import RenderNode from "../class/RenderNode";
import LayoutInitial from "../class/LayoutInitial";

export class ColorSchemeServiceEvents {
  public static COLOR_SCHEME_CHANGE: string = 'color-scheme-change';
}

export default class ColorSchemeService extends AppService {
  public static COLOR_SCHEME_DARK: string = 'dark';

  public static COLOR_SCHEME_DEFAULT: string = 'default';

  public static COLOR_SCHEME_LIGHT: string = 'light';

  public static COLOR_SCHEME_PRINT: string = 'print';

  public static COLOR_SCHEMES: string[] = [
    ColorSchemeService.COLOR_SCHEME_DARK,
    ColorSchemeService.COLOR_SCHEME_DEFAULT,
    ColorSchemeService.COLOR_SCHEME_LIGHT,
    ColorSchemeService.COLOR_SCHEME_PRINT,
  ];

  public static BROWSER_COLOR_SCHEME_DEFAULT = ColorSchemeService.COLOR_SCHEME_LIGHT;

  public static BROWSER_COLOR_SCHEMES: string[] = [
    ColorSchemeService.COLOR_SCHEME_DARK,
    ColorSchemeService.COLOR_SCHEME_LIGHT,
  ];

  private globalColorScheme: string;

  private globalActivePrint: boolean = false;

  registerHooks() {
    return {
      app: {
        hookInit(registry: any) {
          if (registry.assets === MixinsAppService.LOAD_STATUS_COMPLETE) {
            this.services.colorScheme.activateListeners();
            return;
          }

          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
      renderNode: {
        hookInitRenderNode(renderNode: RenderNode) {
          // Initialize main layout.
          if (renderNode instanceof LayoutInitial) {
            // Wait el to be mounted.
            renderNode.ready(() => {
              this.app.layout.colorSchemeSet();
            });
          }
        }
      }
    };
  }

  registerMethods() {
    return {
      renderNode: {
        async colorSchemeSet(
          name?: string
        ) {

          if (!name) {
            name = this.services.colorScheme.getColorScheme();
          }

          // No changes found.
          if (name === this.colorSchemeActive) {
            return;
          }

          this.colorSchemeActive = name;

          let classList = this.el.classList;

          classList.forEach((className) => {
            if (className.startsWith('color-scheme-')) {
              classList.remove(className);
            }
          });

          classList.add(`color-scheme-${this.colorSchemeActive}`);

          await this.assetsUpdate();

          this.services.events.trigger(
            ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE,
            {
              renderNode: this,
              colorScheme: name,
            }
          );
        },
      },
    };
  }

  getColorScheme(): string {
    // Any specification of which color scheme to use,
    // Instead of having a "light" default color scheme,
    // we use the "default" default color scheme.
    if (this.globalColorScheme) {
      if (this.globalActivePrint) {
        return ColorSchemeService.COLOR_SCHEME_PRINT;
      }

      return this.globalColorScheme;
    } else {
      let browserDefault = this.getBrowserNativeColorScheme();

      // User has asked for a non standard default theme (enabled dark mode in device parameter).
      if (browserDefault !== ColorSchemeService.BROWSER_COLOR_SCHEME_DEFAULT) {
        return browserDefault;
      }
    }

    return ColorSchemeService.COLOR_SCHEME_DEFAULT;
  }

  getBrowserNativeColorScheme(): string {
    for (let colorScheme of ColorSchemeService.BROWSER_COLOR_SCHEMES) {
      if (
        window.matchMedia(`(prefers-color-scheme: ${colorScheme})`)
          .matches
      ) {
        return colorScheme;
      }
    }

    return null;
  }

  activateListeners() {
    let assignIfMatch = (
      name,
      callback: Function,
      mediaQuerySelector: string = undefined
    ) => {
      window
        .matchMedia(mediaQuerySelector || name)
        .addEventListener('change', async (e) => {
          callback(e);

          this.app.layout.colorSchemeSet();
        });
    };

    ColorSchemeService.BROWSER_COLOR_SCHEMES.forEach((name: string) => {
      assignIfMatch(name,
        (e) => {
          if (e.matches) {
            this.globalColorScheme = name;
          }
        },
        `(prefers-color-scheme: ${name})`)
    });

    assignIfMatch(
      ColorSchemeService.COLOR_SCHEME_PRINT,
      (e) => {
        this.globalActivePrint = e.matches;
      });
  }
}
