import AssetsService from './AssetsService';
import AppService from '../class/AppService';
import AssetsInterface from '../interfaces/AssetInterface';
import Events from '../helpers/Events';

export class ResponsiveServiceEvents {
  public static RESPONSIVE_CHANGE_SIZE: string = 'responsive-change-size';
}

export default class ResponsiveService extends AppService {
  dependencies: [AssetsService];

  public responsiveSizeCurrent: string;

  public responsiveSizePrevious: string;

  registerHooks() {
    return {
      app: {
        init() {
          let responsiveService = this.services.responsive;

          this.services.assets.updateFilters.push(
            responsiveService.assetUpdateFilter.bind(responsiveService)
          );
        },

        async loadRenderData() {
          let responsiveService = this.services.responsive;

          window.addEventListener(
            Events.RESIZE,
            async () => await responsiveService.updateResponsive(true)
          );

          await responsiveService.updateResponsive(false);
        },
      },
    };
  }

  async updateResponsive(updateAssets: boolean) {
    let current = this.detectSize();

    if (current !== this.responsiveSizeCurrent) {
      this.responsiveSizePrevious = this.responsiveSizeCurrent;
      this.responsiveSizeCurrent = current;

      if (updateAssets) {
        await this.services.assets.updateLayoutAssets();
        // Now change page class.
        this.updateResponsiveLayoutClass();

        this.services.events.trigger(
          ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
          {
            current: current,
            previous: this.responsiveSizePrevious,
          }
        );
      }
    }
  }

  updateResponsiveLayoutClass() {
    // Remove all responsive class names.
    let classList = document.body.classList;

    classList.remove(
      `responsive-${this.services.responsive.responsiveSizePrevious}`
    );
    classList.add(
      `responsive-${this.services.responsive.responsiveSizeCurrent}`
    );
  }

  breakpointSupports(letter) {
    return this.services.responsive.detectSupported().hasOwnProperty(letter);
  }

  detectSupported() {
    let supported = {};
    Object.entries(this.app.layout.vars.displayBreakpoints).forEach(
      (entry) => {
        if (window.innerWidth > entry[1]) {
          supported[entry[0]] = entry[1];
        }
      }
    );

    return supported;
  }

  detectSize() {
    return Object.entries(this.services.responsive.detectSupported()).reduce(
      (prev, current) => {
        // Return item that is the greater one.
        return current[1] > prev[1] ? current : prev;
      }
    )[0];
  }

  assetUpdateFilter(asset: AssetsInterface) {
    if (
      asset.responsive !== null &&
      asset.responsive !== this.responsiveSizeCurrent
    ) {
      return AssetsService.UPDATE_FILTER_REJECT;
    }
  }
}
