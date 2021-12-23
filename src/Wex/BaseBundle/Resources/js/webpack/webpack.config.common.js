const tools = require('./webpack.tools');

// All the CSS files are parsed the same way.
// Ignored CSS files are prefixed by an underscore.
tools.title('All CSS');

tools.templatesLocations.forEach((location) => {
  tools.addAssetsCss(location, 'css/', 'scss');
});

tools.title('Common JS');

// Take only special folders.
let allowed = ['layouts'];

tools.forEachJsExtAndLocations((srcExt, location) => {
  tools.addAssetsJs(location, 'js/', srcExt, (srcFile) => {
    // First dir under js should be a part of allowed dirs.
    return allowed.indexOf(srcFile.file.substring(`${location}js/`.length).split('/')[0]) !== -1 && srcFile;
  });
});


