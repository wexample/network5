const tools = require('./webpack.tools');

tools.title('Components local');

// Local
tools.addAssetsJsWrapped('./assets/', 'js/components/', 'js', 'components');

tools.title('Components local (forms)');

// Local
tools.addAssetsJsWrapped('./assets/', 'js/forms/', 'js', 'components');

// Local components css are built in common config.

tools.title('Components global');

// Global
tools.addAssetsJsWrapped(
  './src/Wex/BaseBundle/Resources/',
  'js/components/',
  'js',
  'components'
);

tools.addAssetsCss(
  './src/Wex/BaseBundle/Resources/',
  'css/components/',
  'scss'
);
