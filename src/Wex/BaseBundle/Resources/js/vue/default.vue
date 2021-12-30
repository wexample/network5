<script>
export default {
  props: {
    rootComponent: Object,
  },

  updated() {
    this.rootComponent.forEachTreeRenderNode((renderNode) => {
      renderNode.updateMounting();
    });
  },
};
</script>
