<script>
import { ResponsiveServiceEvents } from '../services/Responsive';
import { Attribute, AttributeValue, TagName } from '../helpers/Dom';
import { shallowCopy as ArrayShallowCopy } from '../helpers/Arrays';
import { AssetsServiceType } from '../services/Assets';
import Explorer from './explorer';
import { ComponentsServiceEvents } from '../services/Components';
import { ThemeServiceEvents } from '../services/Theme';
import { EventsServiceEvents } from '../services/Events';

export default {
  extends: Explorer,

  components: {
    'explorer-item': 'vue/debug-assets-explorer-item',
  },

  data() {
    return {
      allAssets: [],
      assets: {
        css: [],
        js: [],
      },
      listFilter: null,
      loadedPaths: {
        css: {},
        js: {},
      },
      onChangeResponsiveSizeProxy: this.onChangeResponsiveSize.bind(this),
      updateEvents: [
        ComponentsServiceEvents.CREATE_COMPONENT,
        ResponsiveServiceEvents.RESPONSIVE_CHANGE_SIZE,
        ThemeServiceEvents.THEME_CHANGE,
      ],
      updateTime: 0,
    };
  },

  mounted() {
    this.app.services.events.listen(
        this.updateEvents,
        this.onChangeResponsiveSizeProxy
    );

    this.onChangeResponsiveSize();
  },

  unmounted() {
    this.app.services.events.forget(
        this.updateEvents,
        this.onChangeResponsiveSizeProxy
    );
  },

  methods: {
    buildCssAsset(asset) {
      return {
        'asset-active': asset.active,
        'asset-loaded': asset.loaded,
        'asset-rendered': asset.rendered,
      }
    },

    getAssetsTypeList(type) {
      if (this.selectedItem) {
        return ArrayShallowCopy(
            this.selectedItem.object.renderData.assets[type]
        );
      }

      return [];
    },

    onChangeResponsiveSize() {
      this.update();
    },

    update() {
      this.updateTime = new Date().getTime();
      this.updateAssetsList();
      this.updateAssetsJs();
      this.updateAssetsCss();

      // Ask for display refresh.
      this.$nextTick(() => {
        this.app.services.events.trigger(EventsServiceEvents.DISPLAY_CHANGED);
      });
    },

    selectItem() {
      Explorer.methods.selectItem.apply(this, arguments);

      this.update();
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
          .querySelectorAll(
              `${TagName.LINK}[${Attribute.REL}=${AttributeValue.STYLESHEET}]`
          )
          .forEach((el) => {
            let href = el.getAttribute(Attribute.HREF);
            this.loadedPaths.css[href] = href;
          });
    },

    shortenAssetPath(asset) {
      return asset.path.replace(/^(\/build\/)/, '');
    },
  },
};
</script>
