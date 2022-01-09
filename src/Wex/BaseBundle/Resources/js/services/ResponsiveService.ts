import AssetsService from './AssetsService';
import AppService from '../class/AppService';
import Events from '../helpers/Events';
import RenderNode from '../class/RenderNode';
import RenderNodeUsage from '../class/RenderNodeUsage';

export class ResponsiveServiceEvents {
  public static RESPONSIVE_CHANGE_SIZE: string = 'responsive-change-size';
}

export default class ResponsiveService extends AppService {
  dependencies: [AssetsService];

  registerHooks() {
    return {
      app: {
        async hookLoadLayoutRenderData() {
          window.addEventListener(
            Events.RESIZE,
            async () => await this.app.layout.responsiveUpdate(true)
          );
        },
      },

      renderNode: {
        async hookMounted(renderNode: RenderNode) {
          if (renderNode.responsiveEnabled) {
            await renderNode.responsiveUpdate(
              // Do not propagate as children might not be created.
              false
            );
          }
        },
      },
    };
  }

  registerMethods(object: any, group: string) {
    if (!object.responsiveEnabled) {
      return {};
    }

    return {
      renderNode: {
        responsiveBreakpointIsSupported(letter: string): boolean {
          return this.responsiveBreakpointSupported().hasOwnProperty(letter);
        },

        responsiveDetect() {
          if (!Object.values(this.responsiveBreakpointSupported()).length) {
            this.el.style.display = 'block';
          }

          return Object.entries(this.responsiveBreakpointSupported()).reduce(
            (prev, current) => {
              // Return the greater one.
              return current[1] > prev[1] ? current : prev;
            }
          )[0];
        },

        responsiveBreakpointSupported(): object {
          let supported = {};
          let width = this.getElWidth();

          Object.entries(this.app.layout.vars.displayBreakpoints).forEach(
            (entry) => {
              if (width > entry[1]) {
                supported[entry[0]] = entry[1];
              }
            }
          );

          return supported;
        },

        async responsiveSet(size: string, propagate: boolean) {
          if (size !== this.responsiveSizeCurrent) {
            this.responsiveSizePrevious = this.responsiveSizeCurrent;
            this.responsiveSizeCurrent = size;

            await this.assetsUpdate(RenderNodeUsage.USAGE_RESPONSIVE);

            // Now change page class.
            this.responsiveUpdateClass();

            this.services.events.trigger(
              ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
              {
                current: size,
                previous: this.responsiveSizePrevious,
              }
            );
          }

          if (propagate) {
            await this.forEachTreeChildRenderNode(
              async (renderNode: RenderNode) => {
                if (renderNode.responsiveEnabled) {
                  await renderNode.responsiveSet(size, propagate);
                }
              }
            );
          }
        },

        responsiveUpdateClass() {
          // Remove all responsive class names.
          let classList = this.el.classList;

          classList.remove(`responsive-${this.responsiveSizePrevious}`);
          classList.add(`responsive-${this.responsiveSizeCurrent}`);
        },

        async responsiveUpdate(propagate: boolean) {
          await this.responsiveSet(this.responsiveDetect(), propagate);
        },
      },
    };
  }
}
