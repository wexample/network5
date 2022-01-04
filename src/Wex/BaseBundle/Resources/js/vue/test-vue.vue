<script>
import DefaultVue from './default';

export default {
  extends: DefaultVue,

  components: {
    'vue-test-vue-2': 'vue/test-vue-2',
  },

  props: {
    testVuePropBool: Boolean,
    testVuePropObject: Object,
    testVuePropArray: Array,
  },

  data() {
    return {
      hidePartOfDomContainingComponent: false,
      testData: 'TEST_DATA',
      testNumber: 0,
      translatedStringClientSide: this.trans('@vue::string.client_side'),
    };
  },

  mounted() {
    document.addEventListener('test-vue-event', (data) => {
      this.testNumber++;

      this.hidePartOfDomContainingComponent =
        data.detail.hidePartOfDomContainingComponent;
    });
  },
};
</script>
