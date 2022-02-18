const tools = require('./webpack.tools');

tools.logTitle('JS : Pages');

tools.forEachJsExtAndLocations((srcExt, location) => {
  tools.addAssetsJsWrapped(
    location,
    'pages/',
    srcExt,
    'pages',
    (srcFile) => {
      // If first letter is a capital, this is a included class.
      return !tools.fileIsAClass(srcFile.file) && srcFile;
    }
  );
});
