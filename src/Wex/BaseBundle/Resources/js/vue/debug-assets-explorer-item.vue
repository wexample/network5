<script>
import ExplorerItem from './explorer-item';

export default {
  extends: ExplorerItem,

  props: {
    type: String,
  },

  data() {
    return {
      selected: false,
    };
  },

  mounted() {

  },

  methods: {
    getItemName() {
      return this.type;
    },

    renderItemIcon() {
      return '-';
    },

    getChildren() {
      let children = [];

      if (this.type === 'layout') {
        children.push({
          type: 'page',
          object: this.object.page,
        });
      }

      this.object.components.forEach((component) => {
        children.push({
          type: 'component',
          object: component,
        });
      });

      return children;
    },
  },
};
</script>
