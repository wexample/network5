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

  methods: {
    getItemName() {
      return this.type;
    },

    getItemIcon() {
      return (
          'fa-' +
          {
            component: 'cube',
            layout: 'columns',
            page: 'file',
          }[this.type]
      );
    },

    getChildren() {
      let children = [];

      if (this.type === 'layout') {
        children.push(
            {
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
