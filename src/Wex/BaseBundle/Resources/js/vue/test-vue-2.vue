<script>
import DefaultVue from './default';

export default {
  extends: DefaultVue,

  props: {
    rootComponent: Object,
  },

  data() {
    return {
      testData: 'TEST_DATA_2',
    };
  },
};
</script>
