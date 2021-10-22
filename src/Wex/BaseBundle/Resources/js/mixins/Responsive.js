export default {
  name: 'responsive',

  hooks: {
    app: {
      init() {
        window.addEventListener('resize', this.responsive.resize.bind(this));
        this.responsive.resize();
      },
    },
  },

  methods: {
    app: {
      resize() {
        // Remove all responsive class names.
        let classList = document.body.classList;
        classList.forEach((className) => {
          if (className.indexOf('responsive-') === 0) {
            classList.remove(className);
          }
        });

        classList.add('responsive-' + this.responsive.detectSize(true));
      },

      breakpointSupports(letter) {
        return this.responsive.detectSupported().hasOwnProperty(letter);
      },

      detectSupported() {
        let supported = {};
        Object.entries(this.registry.layoutData.displayBreakpoints).forEach((entry) => {
          if (window.innerWidth > entry[1]) {
            supported[entry[0]] = entry[1];
          }
        });

        return supported;
      },

      detectSize() {
        return Object.entries(this.responsive.detectSupported()).reduce(
          (prev, current) => {
            // Return item that is the greater one.
            return current[1] > prev[1] ? current : prev;
          }
        )[0];
      },
    },
  },
};
