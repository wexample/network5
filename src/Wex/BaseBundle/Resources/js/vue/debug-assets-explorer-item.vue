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
      if (this.type === 'layout') {
        return [
          {
            type: 'page',
            object: this.object.page,
          },
        ];
      } else if (this.type === 'page') {
        let children = [];

        this.object.components.forEach((component) => {
          children.push({
            type: 'component',
            object: component,
          });
        });

        return children;
      }

      return [];
    },
  },
};
</script>
