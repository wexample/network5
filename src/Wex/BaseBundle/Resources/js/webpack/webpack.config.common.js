const tools = require('./webpack.tools');

// All the CSS files are parsed the same way.
// Ignored CSS files are prefixed by an underscore.
tools.title('All CSS');

let locations = [
  // Local.
  './assets/',
  // Core.
  './src/Wex/BaseBundle/Resources/',
];

locations.forEach((location) => {
  tools.addAssetsCss(location, 'css/', 'scss');
});

tools.title('Common JS');

// Take only special folders.
let allowed = ['layouts'];

['js', 'ts'].forEach((srcExt) => {
  locations.forEach((location) => {
    tools.addAssetsJs(location, 'js/', srcExt, (srcFile) => {
      // First dir under js should be a part of allowed dirs.
      return allowed.indexOf(srcFile.file.substring(`${location}js/`.length).split('/')[0]) !== -1 && srcFile;
    });
  });
});
