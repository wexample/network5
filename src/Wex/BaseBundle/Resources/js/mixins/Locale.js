export default {
  name: 'locale',

  hooks: {
    app: {
      loadAppData() {
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
