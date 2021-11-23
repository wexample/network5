import MixinsAppService from '../class/MixinsAppService';
import AppService from '../class/AppService';
import AssetsInterface from '../interfaces/AssetInterface';

export default class ThemeService extends AppService {
  public static THEME_DARK: string = 'dark';

  public static THEME_DEFAULT: string = 'default';

  public static THEME_LIGHT: string = 'light';

  public static THEME_PRINT: string = 'print';

  activeColorScheme?: string = ThemeService.THEME_DEFAULT;
  activePrint: boolean = false;
  activeTheme: string = ThemeService.THEME_DEFAULT;
  colorSchemes: string[] = [ThemeService.THEME_DARK, ThemeService.THEME_LIGHT];
  userHasForced?: null;

  registerHooks() {
    return {
      app: {
        init(registry: any) {
          if (registry.assets === MixinsAppService.LOAD_STATUS_COMPLETE) {
            let themeService = this.services.theme;

            this.app.services.assets.updateFilters.push(
              themeService.assetUpdateFilter.bind(themeService)
            );

            themeService.activateListeners();

            return MixinsAppService.LOAD_STATUS_COMPLETE;
          }

          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    }
  }

  activateListeners() {
    this.colorSchemes.forEach((theme) => {
      window
        .matchMedia(`(prefers-color-scheme: ${theme})`)
        .addEventListener('change', (e) => {
          if (e.matches) {
            this.activeColorScheme = theme;
          } else {
            this.activeColorScheme = ThemeService.THEME_DEFAULT;
          }
          this.updateTheme(true);
        });
    });

    window.matchMedia('print').addEventListener('change', (e) => {
      this.activePrint = e.matches;
      this.updateTheme(true);
    });
  }

  detectTheme(): string {
    // Any specification of which theme to use,
    // Instead of having a "light" default theme,
    // we use the "default" default theme.
    if (!this.userHasForced) {
      return ThemeService.THEME_DEFAULT;
    }

    if (this.activePrint) {
      return ThemeService.THEME_PRINT;
    }

    for (let colorScheme of this.colorSchemes) {
      if (window.matchMedia(`(prefers-color-scheme: ${colorScheme})`).matches) {
        return colorScheme;
      }
    }

    return ThemeService.THEME_DEFAULT;
  }

  setTheme(theme: string, updateAssets: boolean, complete?: Function) {
    let classList = document.body.classList;

    classList.forEach((className) => {
      if (className.startsWith('theme-')) {
        classList.remove(className);
      }
    });

    this.activeTheme = theme;

    classList.add(`theme-${this.activeTheme}`);

    let callback = () => {
      this.services.events.trigger('theme-change', {
        theme: theme,
      });
      complete && complete();
    };

    if (updateAssets) {
      this.services.assets.updateAssets(callback);
    }
  }

  updateTheme(updateAssets: boolean, complete?: Function) {
    let current = this.detectTheme();

    if (this.activeTheme !== current) {
      this.setTheme(current, updateAssets, complete);
    } else {
      complete && complete();
    }
  }

  assetUpdateFilter(asset: AssetsInterface) {
    if (asset.theme !== null && asset.theme !== this.activeTheme) {
      return 'reject';
    }
  }
}
