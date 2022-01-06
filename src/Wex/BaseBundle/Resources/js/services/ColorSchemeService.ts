import MixinsAppService from '../class/MixinsAppService';
import AppService from '../class/AppService';
import AssetsInterface from '../interfaces/AssetInterface';
import AssetsService from './AssetsService';

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

  activeColorScheme?: string = ColorSchemeService.COLOR_SCHEME_DEFAULT;
  activePrint: boolean = false;
  colorSchemes: string[] = [
    ColorSchemeService.COLOR_SCHEME_DARK,
    ColorSchemeService.COLOR_SCHEME_LIGHT,
  ];
  userHasForced?: null;

  registerHooks() {
    return {
      app: {
        hookInit(registry: any) {
          if (registry.assets === MixinsAppService.LOAD_STATUS_COMPLETE) {
            let colorSchemeService = this.services.colorScheme;

            this.app.services.assets.updateFilters.push(
              colorSchemeService.assetUpdateFilter.bind(colorSchemeService)
            );

            colorSchemeService.activateListeners();

            return;
          }

          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    };
  }

  activateListeners() {
    this.colorSchemes.forEach((name: string) => {
      window
        .matchMedia(`(prefers-color-scheme: ${name})`)
        .addEventListener('change', async (e) => {
          if (e.matches) {
            this.activeColorScheme = name;
          } else {
            this.activeColorScheme = ColorSchemeService.COLOR_SCHEME_DEFAULT;
          }
          await this.updateColorScheme(true);
        });
    });

    window.matchMedia('print').addEventListener('change', async (e) => {
      this.activePrint = e.matches;
      await this.updateColorScheme(true);
    });
  }

  detectColorScheme(): string {
    // Any specification of which color scheme to use,
    // Instead of having a "light" default color scheme,
    // we use the "default" default color scheme.
    if (!this.userHasForced) {
      return ColorSchemeService.COLOR_SCHEME_DEFAULT;
    }

    if (this.activePrint) {
      return ColorSchemeService.COLOR_SCHEME_PRINT;
    }

    for (let colorScheme of this.colorSchemes) {
      if (window.matchMedia(`(prefers-color-scheme: ${colorScheme})`).matches) {
        return colorScheme;
      }
    }

    return ColorSchemeService.COLOR_SCHEME_DEFAULT;
  }

  async setColorScheme(name: string, updateAssets: boolean) {
    let classList = document.body.classList;

    classList.forEach((className) => {
      if (className.startsWith('color-scheme-')) {
        classList.remove(className);
      }
    });

    this.activeColorScheme = name;

    classList.add(`color-scheme-${this.activeColorScheme}`);

    if (updateAssets) {
      await this.app.layout.assetsUpdate();
    }

    this.services.events.trigger(ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE, {
      colorScheme: name,
    });
  }

  async updateColorScheme(updateAssets: boolean) {
    let current = this.detectColorScheme();

    if (this.activeColorScheme !== current) {
      await this.setColorScheme(current, updateAssets);
    }
  }

  assetUpdateFilter(asset: AssetsInterface) {
    if (
      asset.colorScheme !== null &&
      asset.colorScheme !== this.activeColorScheme
    ) {
      return AssetsService.UPDATE_FILTER_REJECT;
    }
  }
}
