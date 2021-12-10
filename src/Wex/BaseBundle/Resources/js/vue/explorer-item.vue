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
