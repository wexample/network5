const tools = require('./webpack.tools');

tools.templatesLocations.forEach((location) => {
  tools.addAssetsJsWrapped(location, 'js/', 'vue', 'vue');
});

tools.addAssetsCss('./src/Wex/BaseBundle/Resources/', 'css/vue/', 'scss');

// We have to define manually which css is for vue components.
tools.addAssetsCss(
  './src/Wex/BaseBundle/Resources/',
  'css/forms_themes/vue/',
  'scss'
);
