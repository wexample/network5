<script>
import ExplorerItem from './explorer-item';
import { faCube } from "@fortawesome/free-solid-svg-icons/faCube.js";
import { faColumns } from "@fortawesome/free-solid-svg-icons/faColumns.js";
import { faFile } from "@fortawesome/free-solid-svg-icons/faFile.js";
import { faVuejs } from "@fortawesome/free-brands-svg-icons/faVuejs.js";

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

  methods: {
    getItemName() {
      return this.object.renderData.name;
    },

    renderItemIcon() {
      let icon;

      if (this.object.renderData.name === 'components/vue') {
        icon = faVuejs;
      } else {
        icon = {
          component: faCube,
          layout: faColumns,
          page: faFile,
        }[this.type];
      }

      return icon.icon[4];
    },

    getChildren() {
      let children = [];

      if (this.type === 'layout') {
        children.push({
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
