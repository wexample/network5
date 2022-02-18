const tools = require('./webpack.tools');

// Project level

tools.logTitle('JS Project level components');

tools.forEachJsExtAndLocations((srcExt, location) => {
  tools.addAssetsJsWrapped(
    location,
    'components/',
    srcExt,
    'components'
  );
});

tools.logTitle('JS Project level components (forms)');

// Project level
tools.forEachJsExtAndLocations((srcExt, location) => {
  tools.addAssetsJsWrapped(
    location,
    'forms/',
    srcExt,
    'components'
  );
});

// Local components css are built in common config.

// Core level

tools.logTitle('JS Core level components');

tools.jsFilesExtensions.forEach((srcExt) => {
  tools.addAssetsJsWrapped(
    './src/Wex/BaseBundle/Resources/js/',
    'components/',
    srcExt,
    'components'
  );
});
