export default {
  name: 'locale',

  hooks: {
    app: {
      loadRenderData() {
        return 'complete';
      },
    },
  },

  methods: {
    app: {
      transDomains: {},
    },
  },
};
