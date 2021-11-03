import MixinInterface from "../interfaces/MixinInterface";
import MixinsAppService from "../class/MixinsAppService";
import AppService from "../class/AppService";
import AssetsInterface from "../interfaces/AssetInterface";

const mixin: MixinInterface = {
    name: 'theme',

    dependencies: {},

    hooks: {
        app: {
            init(registry: any) {
                if (registry.MixinAssets === MixinsAppService.LOAD_STATUS_COMPLETE) {
                    let assetsService = this.app.getService('assets');
                    let themeService = this.app.getService('theme');

                    assetsService.updateFilters.push(themeService.assetUpdateFilter.bind(themeService));

                    themeService.updateTheme(false);

                    themeService.activateListeners();

                    return MixinsAppService.LOAD_STATUS_COMPLETE;
                }

                return MixinsAppService.LOAD_STATUS_WAIT;
            },
        },
    },

    service: class ThemeService extends AppService {
        public static THEME_DARK: string = 'dark';
        public static THEME_DEFAULT: string = 'default';
        public static THEME_LIGHT: string = 'light';
        public static THEME_PRINT: string = 'print';

        activeColorScheme?: string = ThemeService.THEME_DEFAULT
        activePrint: boolean = false
        activeTheme: string = null

        colorSchemes: string[] = [
            ThemeService.THEME_DARK,
            ThemeService.THEME_LIGHT
        ]

        userHasForced?: null

        activateListeners() {
            this.colorSchemes.forEach((theme) => {
                window.matchMedia(`(prefers-color-scheme: ${theme})`).addEventListener(
                    'change',
                    (e) => {
                        if (e.matches) {
                            this.activeColorScheme = theme;
                        } else {
                            this.activeColorScheme = ThemeService.THEME_DEFAULT;
                        }
                        this.updateTheme(true);
                    });
            });

            window.matchMedia('print').addEventListener(
                'change',
                (e) => {
                    this.activePrint = e.matches
                    this.updateTheme(true);
                });
        }

        detectTheme(): string {
            // Any specification of which theme to use,
            // Instead of having a "light" default theme,
            // we use the "default" default theme.
            if (!this.userHasForced) {
                return ThemeService.THEME_DEFAULT
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
            document.body.classList.remove(`theme-${this.activeTheme}`);

            this.activeTheme = theme;

            document.body.classList.add(`theme-${this.activeTheme}`);

            if (this.activeTheme !== ThemeService.THEME_DEFAULT) {
                if (updateAssets) {
                    let assetsService = this.app.getService('assets');
                    assetsService.updateAssets(complete);
                }
            } else {
                complete && complete();
            }
        }

        updateTheme(updateAssets: boolean, complete?: Function) {
            let previous = this.activeTheme;
            let current = this.detectTheme();

            if (previous !== current) {
                this.setTheme(current, updateAssets, complete);
            } else {
                complete && complete();
            }
        }

        assetUpdateFilter(asset: AssetsInterface) {
            if (asset.theme !== null
                && asset.theme !== this.activeTheme) {
                return 'reject';
            }
        }
    },
};

export default mixin;