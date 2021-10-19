const tools = require('./webpack.tools');

tools.title('Vues local');

tools.addAssetsJsWrapped('./assets/', 'js/', 'vue', 'vue');

tools.title('Vues global');

// Global
tools.addAssetsJsWrapped(
  './src/Wex/BaseBundle/Resources/',
  'js/',
  'vue',
  'vue'
);

tools.addAssetsCss('./src/Wex/BaseBundle/Resources/', 'css/vue/', 'scss');

// We have to define manually which css is for vue components.
tools.addAssetsCss(
  './src/Wex/BaseBundle/Resources/',
  'css/forms_themes/vue/',
  'scss'
);
