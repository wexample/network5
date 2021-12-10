<script>
export default {
  props: {
    increment: Number,
    object: Object,
    type: String,
    root: Object,
  },

  components: {
    'explorer-item': 'vue/explorer-item',
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
            object: component
          })
        });

        return children;
      }

      return [];
    },

    select() {
      this.root.selectItem(this);
    },

    deselect() {
      this.root.deselectItem(this);
    },
  },
};
</script>
