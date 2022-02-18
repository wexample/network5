const tools = require('./webpack.tools');

// All the CSS files are parsed the same way.
// Ignored CSS files are prefixed by an underscore.
tools.logTitle('CSS : all');

tools.buildAssetsLocationsList('css').forEach((location) => {
  tools.addAssetsCss(
    location,
    '',
    'scss'
  );
});

// Take only js that is not in special folders.
tools.logTitle('JS : mains');

// Take only special folders.
let allowed = ['layouts'];

tools.forEachJsExtAndLocations((srcExt, location) => {
  tools.addAssetsJs(location, '', srcExt, (srcFile) => {
    // First dir under js should be a part of allowed dirs.
    return (
      allowed.indexOf(
        srcFile.file.substring(location.length).split('/')[0]
      ) !== -1 &&
      !tools.fileIsAClass(srcFile.file) &&
      srcFile
    );
  });
});
