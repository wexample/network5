const tools = require('./webpack.tools');

tools.title('Pages JS');

tools.addAssetsJsWrapped('./assets/', 'js/pages/', 'js', 'pages');
