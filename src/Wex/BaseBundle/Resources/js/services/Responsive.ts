import AssetsService from './Assets';
import EventsService from './Events';
import QueuesService from './Queues';
import AppService from '../class/AppService';
import MixinsAppService from '../class/MixinsAppService';
import AssetsInterface from '../interfaces/AssetInterface';
import Events from "../helpers/Events";

export default class ResponsiveService extends AppService {
  dependencies: [AssetsService, EventsService, QueuesService];

  public responsiveSizeCurrent: string;

  public responsiveSizePrevious: string;

  registerHooks() {
    return {
      app: {
        init(registry: any) {
          if (registry.assets === MixinsAppService.LOAD_STATUS_COMPLETE) {
            let responsiveService = this.services.responsive;

            this.services.assets.updateFilters.push(
              responsiveService.updateFilters.bind(responsiveService)
            );

            window.addEventListener(Events.RESIZE, () =>
              responsiveService.updateResponsive(true)
            );

            responsiveService.updateResponsive(false);

            return MixinsAppService.LOAD_STATUS_COMPLETE;
          }

          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    };
  }

  updateResponsive(updateAssets: boolean, complete?: Function) {
    let current = this.detectSize();

    if (current !== this.responsiveSizeCurrent) {
      this.responsiveSizePrevious = this.responsiveSizeCurrent;
      this.responsiveSizeCurrent = current;

      if (updateAssets) {
        this.services.assets.updateAssets(() => {
          // Now change page class.
          this.updateResponsiveLayoutClass();

          this.services.events.trigger('responsive-change-size', {
            current: current,
            previous: this.responsiveSizePrevious,
          });

          complete && complete();
        });
      }
    } else {
      complete && complete();
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
    Object.entries(this.app.layout.renderData.displayBreakpoints).forEach(
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

  updateFilters(asset: AssetsInterface) {
    if (
      asset.responsive !== null &&
      asset.responsive !== this.responsiveSizeCurrent
    ) {
      return 'reject';
    }
  }
}
