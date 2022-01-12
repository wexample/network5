import MixinsAppService from '../class/MixinsAppService';
import AppService from '../class/AppService';

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

  public static COLOR_SCHEMES_PREFERENCES: string[] = [
    ColorSchemeService.COLOR_SCHEME_DARK,
    ColorSchemeService.COLOR_SCHEME_LIGHT,
  ];

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
    };
  }

  registerMethods() {
    return {
      renderNode: {
        colorSchemeDetect(): string {
          // Any specification of which color scheme to use,
          // Instead of having a "light" default color scheme,
          // we use the "default" default color scheme.
          if (!this.colorSchemeForced) {
            return ColorSchemeService.COLOR_SCHEME_DEFAULT;
          }

          if (this.colorSchemeActivePrint) {
            return ColorSchemeService.COLOR_SCHEME_PRINT;
          }

          for (let colorScheme of ColorSchemeService.COLOR_SCHEMES_PREFERENCES) {
            if (
              window.matchMedia(`(prefers-color-scheme: ${colorScheme})`)
                .matches
            ) {
              return colorScheme;
            }
          }

          return ColorSchemeService.COLOR_SCHEME_DEFAULT;
        },

        async colorSchemeSet(name: string, updateAssets: boolean) {
          let classList = document.body.classList;

          classList.forEach((className) => {
            if (className.startsWith('color-scheme-')) {
              classList.remove(className);
            }
          });

          this.app.layout.activeColorScheme = name;

          classList.add(`color-scheme-${this.app.layout.activeColorScheme}`);

          if (updateAssets) {
            await this.app.layout.assetsUpdate();
          }

          this.services.events.trigger(
            ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE,
            {
              renderNode: this,
              colorScheme: name,
            }
          );
        },

        async colorSchemeUpdate(updateAssets: boolean) {
          let current = this.colorSchemeDetect();

          if (this.activeColorScheme !== current) {
            await this.colorSchemeSet(current, updateAssets);
          }
        },
      },
    };
  }

  activateListeners() {
    ColorSchemeService.COLOR_SCHEMES_PREFERENCES.forEach((name: string) => {
      window
        .matchMedia(`(prefers-color-scheme: ${name})`)
        .addEventListener('change', async (e) => {
          if (e.matches) {
            this.app.layout.activeColorScheme = name;
          } else {
            this.app.layout.activeColorScheme =
              ColorSchemeService.COLOR_SCHEME_DEFAULT;
          }
          await this.app.layout.colorSchemeUpdate(true);
        });
    });

    window.matchMedia('print').addEventListener('change', async (e) => {
      this.app.layout.colorSchemeActivePrint = e.matches;
      await this.app.layout.colorSchemeUpdate(true);
    });
  }
}
