const tools = require('./webpack.tools');

tools.title('Components local');

// Local
['js', 'ts'].forEach((srcExt) => {
  tools.addAssetsJsWrapped('./assets/', 'js/components/', srcExt, 'components');
});

tools.title('Components local (forms)');

// Local
['js', 'ts'].forEach((srcExt) => {
  tools.addAssetsJsWrapped('./assets/', 'js/forms/', srcExt, 'components');
});

// Local components css are built in common config.

tools.title('Components global');

// Global
['js', 'ts'].forEach((srcExt) => {
  tools.addAssetsJsWrapped(
    './src/Wex/BaseBundle/Resources/',
    'js/components/',
    srcExt,
    'components'
  );
});
