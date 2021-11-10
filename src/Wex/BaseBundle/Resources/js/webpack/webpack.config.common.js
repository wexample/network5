const tools = require('./webpack.tools');

// All the CSS files are parsed the same way.
tools.title('All CSS');

tools.addAssetsCss('./assets/', 'css/', 'scss');

// Take only js that is not in special folders.
tools.title('Common JS');

let disallowed = ['components', 'forms', 'pages', 'vue'];

['js', 'ts'].forEach((srcExt) => {
  tools.addAssetsJs('./assets/', 'js/', srcExt, (srcFile) => {
    // First dir under js should not be a part of disallowed dirs.
    return disallowed.indexOf(srcFile.file.split('/')[3]) === -1 && srcFile;
  });
});
