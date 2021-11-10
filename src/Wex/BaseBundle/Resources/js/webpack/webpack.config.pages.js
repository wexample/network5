const tools = require('./webpack.tools');

tools.title('Pages JS');

['js', 'ts'].forEach((srcExt) => {
  tools.addAssetsJsWrapped('./assets/', 'js/pages/', srcExt, 'pages');
});
