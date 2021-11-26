// Script par of a Vue component.
import RenderNode from "../RenderNode";

export default {
  props: {
    name: String,
    renderNode: RenderNode,
    debugRenderNode: Object,
  },

  data() {
    return {
      backgroundColor: 'transparent'
    }
  },

  methods: {
    renderDebugInfo() {
      return [
        this.name,
      ].join('<br>')
    },

    styleObject() {
      return {
        backgroundColor: this.debugRenderNode.getBorderColor(),
      }
    }
  }
}