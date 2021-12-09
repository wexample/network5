// Script par of a Vue component.
import RenderNode from '../RenderNode';
import { h } from 'vue';
import Page from '../Page';
import ThemeService from '../../services/Theme';
import { TagName } from '../../helpers/Dom';

export default {
  props: {
    app: Object,
    debugRenderNode: Object,
    renderNode: RenderNode,
    renderData: {
      type: Object,
      default: {},
    },
    requestOptions: {
      type: Object,
      default: {},
    },
  },

  data() {
    return {
      backgroundColor: 'transparent',
      displayBreakpoints: this.app.layout.renderData.displayBreakpoints,
    };
  },

  render() {
    let renderLineTitle = (title) => {
      return h(
        TagName.DIV,
        {
          class: 'line-title',
        },
        title
      );
    };

    let renderResponsive = (type) => {
      return h(
        TagName.DIV,
        {
          class: ['debug-info-line', 'display-breakpoints'],
        },
        [
          renderLineTitle(type.toUpperCase()),
          Object.keys(this.app.layout.renderData.displayBreakpoints).map(
            (size) => {
              return h(
                TagName.DIV,
                {
                  class: {
                    active:
                      this.app.services.responsive.responsiveSizeCurrent ===
                      size,
                    available: this.hasResponsiveAsset(type, size),
                  },
                },
                size.toUpperCase()
              );
            }
          ),
        ]
      );
    };

    let renderPage = () => {
      if (this.renderNode instanceof Page) {
        return h(
          TagName.DIV,
          {
            class: 'debug-info-line',
          },
          [
            renderLineTitle('COL.S'),
            ThemeService.THEMES.map((theme) => {
              return h(
                TagName.DIV,
                {
                  class: {
                    active: this.app.services.theme.activeTheme === theme,
                    available: this.hasThemeAsset('css', theme),
                  },
                },
                theme.toUpperCase()
              );
            }),
          ]
        );
      }
    };

    return h(
      TagName.DIV,
      {
        class: 'debug-info',
        style: this.styleObject(),
      },
      [
        h(TagName.DIV, {}, this.renderDebugInfo()),
        renderPage(),
        renderResponsive('css'),
        renderResponsive('js'),
      ]
    );
  },

  methods: {
    renderDebugInfo() {
      return [this.renderData.name].join('<br>');
    },

    hasResponsiveAsset(type: string, size: string): boolean {
      if (this.renderData.assets) {
        for (let asset of this.renderData.assets[type]) {
          if (asset.responsive === size) {
            return true;
          }
        }
      }

      return false;
    },

    hasThemeAsset(type: string, scheme: string) {
      if (this.renderData.assets) {
        for (let asset of this.renderData.assets[type]) {
          // TODO Context is wrong and always true.
          if (asset.theme === scheme) {
            return true;
          }
        }
      }

      return true;
    },

    styleObject() {
      return {
        backgroundColor: this.debugRenderNode.getBorderColor(),
      };
    },
  },
};
