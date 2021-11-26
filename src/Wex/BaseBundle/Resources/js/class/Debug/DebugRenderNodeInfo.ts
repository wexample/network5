// Script par of a Vue component.
import RenderNode from "../RenderNode";

export default {
  props: {
    app: Object,
    debugRenderNode: Object,
    renderNode: RenderNode,
    renderData: {
      type: Object,
      default: {}
    },
    requestOptions: {
      type: Object,
      default: {}
    },
  },

  data() {
    return {
      backgroundColor: 'transparent',
      displayBreakpoints: this.app.layout.renderData.displayBreakpoints
    }
  },

  methods: {
    renderDebugInfo() {
      return [
        this.renderData.name,
      ].join('<br>')
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
      }
    },

    classObjectDisplayBreakpoint(type: string, size: string) {
      return {
        active: this.hasResponsiveAsset(type, size)
      }
    }
  }
}