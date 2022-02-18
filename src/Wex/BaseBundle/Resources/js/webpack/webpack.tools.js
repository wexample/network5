const Encore = require('@symfony/webpack-encore');
const glob = require('glob');
const fs = require('fs');

let entries = {};

module.exports = {
  jsFilesExtensions: ['js', 'ts'],
  tempPath: './var/tmp/build/',
  wrapperTemplatePath: './src/Wex/BaseBundle/Resources/js/build/wrapper.js.tpl',
  extToTypesMap: {
    css: 'css',
    js: 'js',
    scss: 'css',
    ts: 'js',
    vue: 'js',
  },

  buildAssetsLocationsList(type) {
    return [
      // Project level.
      `./assets/${type}/`,
      './front/',
      // Core level.
      `./src/Wex/BaseBundle/Resources/${type}/`,
    ];
  },

  getFileName(path) {
    return path.substring(path.lastIndexOf('/') + 1);
  },

  fileIsAClass(filePath) {
    let fileName = this.getFileName(filePath);
    // If first letter is a capital, this is a included class.
    return fileName[0].toUpperCase() === fileName[0];
  },

  forEachJsExtAndLocations(callback) {
    this.jsFilesExtensions.forEach((srcExt) => {
      this.buildAssetsLocationsList('js').forEach((location) => {
        callback(srcExt, location);
      });
    });
  },

  logTitle(string, color = 'cyan') {
    console.log('');
    console.log(module.exports.textLogColor('# ' + string.toUpperCase(), color));
  },

  /**
   * @from: https://gist.github.com/youssman/745578062609e8acac9f
   * @param myStr
   * @returns {*}
   */
  camelCaseToDash: myStr => {
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

  removeFileExtension: fileName => {
    return fileName
      .split('.')
      .slice(0, -1)
      .join('.');
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

    for (let file of files) {
      let srcFile = {
        dir: srcAssetsDir,
        file: file,
      };
      // Allow callback to filter files to pack.
      srcFile = callback ? callback(srcFile) : srcFile;

      if (srcFile) {
        let basename = srcFile.file.split('/').reverse()[0];

        // Exclude underscores.
        if (basename[0] !== '_') {
          let finalExt = module.exports.extToTypesMap[srcExt];
          let fileDest = finalExt
            + '/' + srcFile.file
              .substr(srcFile.dir.length)
              .split('.')
              .slice(0, -1)
              .join('.');

          // Ignore duplicates, it allows local script to override core script.
          if (!entries[fileDest]) {
            const pathDestRel =
              srcFile.file.substr(srcFile.dir.length);

            console.log('    From', file);
            module.exports.logVarPath('      > watching : ', srcFile.dir, pathDestRel);
            module.exports.logVarPath('      > to       : ', './public/build/', fileDest);
            console.log('');

            entries[fileDest] = srcFile.file;
            Encore[command](fileDest, srcFile.file);
          } else {
            console.log('    Ignoring : ' + file);
            module.exports.logVarPath('        > Item already registered : ', fileDest);
            console.log('');
          }
        }
      }
    }
  },

  logVar(name, value = '', color, colorLabel = 'grayMedium') {
    console.log(
      module.exports.textLogColor(name, colorLabel)
      + module.exports.textLogColor(value, color)
    );
  },

  logVarPath() {
    let args = [...arguments];

    module.exports.logVar(
      args.shift(),
      module.exports.textLogPath.apply(this, args)
    );
  },

  logPath() {
    console.log(module.exports.textLogPath.apply(this, arguments));
  },

  textLogPath(one, two, three) {
    let output = '';

    output += module
      .exports
      .textLogColor(one, two || three ? 'cyanDark' : 'yellowDark');

    if (two) {
      output += module
        .exports
        .textLogColor(two, (three ? 'cyan' : 'yellowDark'));
    }

    if (three) {
      output += module
        .exports
        .textLogColor(three, 'yellowDark');
    }

    return output;
  },

  textLogColor(text, color = 'default', style = 'regular') {
    style = {
      bold: 1,
      regular: 0,
      underline: 4,
    }[style];

    if (typeof color === 'string') {
      color = {
        blue: '012',
        blueDark: '004',
        cyan: '014',
        cyanDark: '006',
        default: '250',
        grayLight: '248',
        grayMedium: '243',
        grayDark: '240',
        yellow: '011',
        yellowDark: '003'
      }[color];
    }

    return "\033[" + `${style};38;5;${color}m${text}\x1b[0m`;
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
        className.push(module.exports.camelCaseToDash(className.pop()));
        className = className.join('/');

        fs.mkdirSync(assetPathTemp, {recursive: true});

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
