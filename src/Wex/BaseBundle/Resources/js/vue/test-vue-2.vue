<script>
import DefaultVue from './default';

export default {
  extends: DefaultVue,

  data() {
    return {
      testData: 'TEST_DATA_2',
      translatedStringClientSide2: this.trans('@vue::string.client_side'),
    };
  },
};
</script>
