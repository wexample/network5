<script>
export default {
  props: {
    type: String,
    object: Object
  },

  components: {
    'explorer-item': 'vue/debug-assets-explorer-item',
  },

  data() {
    return {};
  },

  methods: {
    getItemName() {
      return 'Layout';
    },

    getItemIcon() {
      return 'fa-' + {
        'layout': 'columns'
      }[this.type];
    },
  }
};
</script>
