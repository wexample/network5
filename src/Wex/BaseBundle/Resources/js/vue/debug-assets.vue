<script>
import { ResponsiveServiceEvents } from '../services/Responsive';
import { Attribute, AttributeValue, TagName } from '../helpers/Dom';
import { shallowCopy as ArrayShallowCopy } from '../helpers/Arrays';
import { AssetsServiceType } from '../services/Assets';
import Explorer from './explorer';

export default {
  extends:Explorer,

  components: {
    'explorer-item': 'vue/explorer-item',
  },

  data() {
    return {
      allAssets: [],
      assets: {
        css: [],
        js: [],
      },
      explorerItems: [],
      listFilter: null,
      loadedPaths: {
        css: {},
        js: {},
      },
      onChangeResponsiveSizeProxy: this.onChangeResponsiveSize.bind(this),
    };
  },

  mounted() {
    this.app.services.events.listen(
        ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
        this.onChangeResponsiveSizeProxy
    );

    this.onChangeResponsiveSize();
  },

  unmounted() {
    this.app.services.events.forget(
        ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
        this.onChangeResponsiveSizeProxy
    );
  },

  methods: {
    onChangeResponsiveSize() {
      this.updateExplorerItems();
      this.updateAssetsList();
      this.updateAssetsJs();
      this.updateAssetsCss();
    },

    updateAssetsList() {
      let list = [];

      [AssetsServiceType.CSS, AssetsServiceType.JS].forEach((type) => {
        if (this.listFilter === null || this.listFilter === type) {
          list = [...list, ...this.getAssetsTypeList(type)];
        }
      });

      this.allAssets = list;
    },

    getAssetsTypeList(type) {
      return ArrayShallowCopy(this.app.layout.renderData.assets[type]);
    },

    updateAssetsJs() {
      // Base loaded assets
      document.querySelectorAll(TagName.SCRIPT).forEach((el) => {
        let src = el.getAttribute(Attribute.SRC);

        // Avoid inline scripts.
        if (src !== null) {
          this.loadedPaths.js[src] = src;
        }
      });
    },

    updateAssetsCss() {
      let list = [];

      // Base loaded assets
      document
          .querySelectorAll(`${TagName.LINK}[${Attribute.REL}=${AttributeValue.STYLESHEET}]`)
          .forEach((el) => {

            let href = el.getAttribute(Attribute.HREF);
            this.loadedPaths.css[href] = href;
          });
    },

    updateExplorerItems() {
      let items = [
        {
          type: 'layout',
          object: this.app.layout,
        }
      ];

      this.explorerItems = items;
    },

    shortenAssetPath(asset) {
      return asset.path.replace(/^(\/build\/)/, "");
    }
  },
};
</script>
