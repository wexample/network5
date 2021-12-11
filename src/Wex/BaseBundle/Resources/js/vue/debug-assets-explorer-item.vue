<script>
import ExplorerItem from './explorer-item';
import { icon as faIcon, library as faLibrary } from '@fortawesome/fontawesome-svg-core'
import { faCube, faFile, faColumns } from '@fortawesome/free-solid-svg-icons'
import { faVuejs } from '@fortawesome/free-brands-svg-icons'

export default {
  extends: ExplorerItem,

  props: {
    type: String,
  },

  data() {
    return {
      selected: false,
    };
  },

  mounted() {
    faLibrary.add(faCube,
        faFile,
        faColumns,
        faVuejs
    );
  },

  methods: {
    getItemName() {
      return this.type;
    },

    renderItemIcon() {
      let options;

      if (this.object.renderData.name === 'components/vue') {
        options = faVuejs;
      } else {

        options = {
          component: faCube,
          layout: faColumns,
          page: faFile,
        }[this.type];
      }

      return faIcon(options).html;
    },

    getChildren() {
      let children = [];

      if (this.type === 'layout') {
        children.push(
            {
              type: 'page',
              object: this.object.page,
            });
      }

      this.object.components.forEach((component) => {
        children.push({
          type: 'component',
          object: component,
        });
      });

      return children;
    },
  },
};
</script>
