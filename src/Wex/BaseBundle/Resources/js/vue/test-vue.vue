<script>
export default {
  props: {
    testVuePropBool: Boolean,
    testVuePropObject: Object,
    testVuePropArray: Array,
  },

  data() {
    return {
      testData: 'TEST_DATA',
      testNumber: 0,
      translatedStringClientSide: this.trans('@vue::string.client_side')
    };
  },

  mounted() {
    document.addEventListener('test-vue-event', () => {
      this.testNumber++;
    });
  }
};
</script>
