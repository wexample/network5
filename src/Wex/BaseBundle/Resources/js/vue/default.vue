<script>
export default {
  updated() {
    this.rootComponent.forEachTreeRenderNode((renderNode) => {
      if (this === this.$root) {
        renderNode.updateMounting();
      }
    });
  },
};
</script>
