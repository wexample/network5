const tools = require('./webpack.tools');

tools.title('Pages JS');

tools.forEachJsExtAndLocations((srcExt, location) => {
  tools.addAssetsJsWrapped(location, 'js/pages/', srcExt, 'pages');
});
