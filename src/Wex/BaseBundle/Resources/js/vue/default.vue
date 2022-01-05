<script>
export default {
  updated() {
    this.rootComponent.forEachTreeRenderNode((renderNode) => {
      renderNode.updateMounting();
    });
  },
};
</script>
