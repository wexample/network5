// Script par of a Vue component.
import RenderNode from '../RenderNode';
import { h } from "vue";

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
    let renderResponsive = (type) => {
      return h('div', {
        class: 'display-breakpoints',
      }, [
        h(
          'div',
          {
            class: 'line-title'
          },
          type.toUpperCase()
        ),
        Object.keys(this.app.layout.renderData.displayBreakpoints).map((size) => {
          return h('div', {
            class: {
              active: this.hasResponsiveAsset(type, size)
            },
          }, size.toUpperCase())
        })
      ]);
    }

    return h(
      'div',
      {
        class: 'debug-info',
        style: this.styleObject()
      },
      [
        h('div', {}, this.renderDebugInfo()),
        renderResponsive('css'),
        renderResponsive('js')
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

    styleObject() {
      return {
        backgroundColor: this.debugRenderNode.getBorderColor(),
      };
    },
  },
};
