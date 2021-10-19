const Encore = require('@symfony/webpack-encore');
const glob = require('glob');
const fs = require('fs');

module.exports = {
  title(string) {
    console.log('');
    console.log('---###  ' + string.toUpperCase() + '  ###---');
  },

  /**
   * @from: https://gist.github.com/youssman/745578062609e8acac9f
   * @param myStr
   * @returns {*}
   */
  camelCaseToDash: (myStr) => {
    return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  pathToCamel: (path) => {
    return path
      .split('/')
      .map((string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      })
      .join('');
  },

  removeFileExtension: (fileName) => {
    return fileName.split('.').slice(0, -1).join('.');
  },

  /**
   * Map ./assets/(js|css)/* to ./public/build/(js|css)/*
   */
  addAssetsSyncEntries: (
    srcAssetsDir,
    srcSubDir,
    srcExt,
    command,
    callback
  ) => {
    let files = glob.sync(srcAssetsDir + srcSubDir + '**/*.' + srcExt);

    for (let srcFile of files) {
      srcFile = {
        dir: srcAssetsDir,
        file: srcFile,
      };
      // Allow callback to filter files to pack.
      srcFile = callback ? callback(srcFile) : srcFile;

      if (srcFile) {
        let basename = srcFile.file.split('/').reverse()[0];

        // Exclude underscores.
        if (basename[0] !== '_') {
          let fileDist = srcFile.file
            .substr(srcFile.dir.length)
            .split('.')
            .slice(0, -1)
            .join('.');

          console.log('Watching : ' + srcFile.file);
          console.log('    -> to ' + fileDist);
          Encore[command](fileDist, srcFile.file);
        }
      }
    }
  },

  addAssetsCss: (srcAssetsDir, srcSubDir, srcExt, callback) => {
    return module.exports.addAssetsSyncEntries(
      srcAssetsDir,
      srcSubDir,
      srcExt,
      'addStyleEntry',
      callback
    );
  },

  addAssetsJs: (srcAssetsDir, srcSubDir, srcExt, callback) => {
    return module.exports.addAssetsSyncEntries(
      srcAssetsDir,
      srcSubDir,
      srcExt,
      'addEntry',
      callback
    );
  },

  tempPath: './var/tmp/build/',
  wrapperTemplatePath: './src/Wex/BaseBundle/Resources/js/build/wrapper.js.tpl',

  getPathFromTemp() {
    return '../'.repeat(module.exports.tempPath.split('/').length - 1);
  },

  getRootPathFrom(path) {
    return (
      module.exports.getPathFromTemp() +
      '../'.repeat(path.split('/').length - 1)
    );
  },

  addAssetsJsWrapped: (srcAssetsDir, srcSubDir, srcExt, type, callback) => {
    let templateContentBase = fs.readFileSync(
      module.exports.wrapperTemplatePath,
      'utf8'
    );

    module.exports.addAssetsJs(srcAssetsDir, srcSubDir, srcExt, (srcFile) => {
      // Allow callback to filter files to pack.
      srcFile = callback ? callback(srcFile) : srcFile;

      if (srcFile) {
        let pathWithoutExt = module.exports.removeFileExtension(
          srcFile.file.slice(srcAssetsDir.length)
        );
        let exp = pathWithoutExt.split('/');
        let fileNameWithoutExt = exp.pop();
        let rootPathFromAsset = module.exports.getRootPathFrom(exp.join('/'));
        let assetPathRelative = exp.join('/') + '/';
        let assetPathTemp = module.exports.tempPath + assetPathRelative;
        let templateContent = templateContentBase;
        let className = pathWithoutExt.split('/');
        className.shift();
        className.push(module.exports.camelCaseToDash(className.pop()));
        className = className.join('/');

        fs.mkdirSync(assetPathTemp, { recursive: true });

        let placeHolders = {
          type: type,
          className: className,
          classPath: rootPathFromAsset + srcFile.file,
        };

        Object.entries(placeHolders).forEach((data) => {
          let placeHolder = data[0];
          let value = data[1];

          templateContent = templateContent.replace(
            new RegExp('{' + placeHolder + '}', 'g'),
            value
          );
        });

        let wrapperPath =
          assetPathTemp +
          module.exports.camelCaseToDash(fileNameWithoutExt) +
          '.js';
        fs.writeFileSync(wrapperPath, templateContent);

        return {
          dir: module.exports.tempPath,
          file: wrapperPath,
        };
      }
    });
  },
};
