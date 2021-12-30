<script>
import DefaultBue from './default';

export default {
  extends: DefaultBue,

  props: {
    rootComponent: Object,
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
