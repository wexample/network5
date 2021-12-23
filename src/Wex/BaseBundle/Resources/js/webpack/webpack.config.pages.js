const tools = require('./webpack.tools');

tools.title('Pages JS');

tools.forEachJsExtAndLocations((srcExt, location) => {
  tools.addAssetsJsWrapped(location, 'js/pages/', srcExt, 'pages', (srcFile) => {
    // If first letter is a capital, this is a included class.
    return !tools.fileIsAClass(srcFile.file)
      && srcFile;
  });
});
