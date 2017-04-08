'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var postcss = _interopDefault(require('postcss'));
var styleInject = _interopDefault(require('style-inject'));
var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var mkdirp = _interopDefault(require('mkdirp'));
var Concat = _interopDefault(require('concat-with-sourcemaps'));

function cwd(file) {
  return path.join(process.cwd(), file);
}

function writeFilePromise(dest, content) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, content, function (err) {
      if (err) return reject(err);

      resolve();
    });
  });
}

function extractCssAndWriteToFile(source, manualDest, autoDest, sourceMap) {
  var fileName = path.basename(autoDest, path.extname(autoDest));
  var cssOutputDest = manualDest ? manualDest : path.join(path.dirname(autoDest), fileName + '.css');
  var css = source.content.toString("utf8");
  if (sourceMap) {
    var map = source.sourceMap;
    if (!manualDest) {
      map = JSON.parse(map);
      map.file = fileName + '.css';
      map = JSON.stringify(map);
    }
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + Buffer.from(map, 'utf8').toString('base64') + ' */';
  }
  return writeFilePromise(cssOutputDest, css);
}

var index = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var filter = rollupPluginutils.createFilter(options.include, options.exclude);
  var injectFnName = '__$styleInject';
  var extensions = options.extensions || ['.css', '.sss'];
  var getExport = options.getExport || function () {};
  var combineStyleTags = !!options.combineStyleTags;
  var extract = options.export || false;
  var extractPath = typeof extract == "string" ? extract : false;

  if (extractPath) mkdirp(path.dirname(extractPath), function (err) {
    if (err) throw Error(err);
  });

  var concat = new Concat(true, path.basename(extractPath || 'styles.css'), '\n');

  var injectStyleFuncCode = styleInject.toString().replace(/styleInject/, injectFnName);

  return {
    intro: function intro() {
      if (extract) return;
      if (combineStyleTags) return injectStyleFuncCode + '\n' + injectFnName + '(' + JSON.stringify(concat.content.toString('utf8')) + ')';
      return injectStyleFuncCode;
    },
    transform: function transform(code, id) {
      if (!filter(id)) return null;
      if (extensions.indexOf(path.extname(id)) === -1) return null;
      var opts = {
        from: options.from ? cwd(options.from) : id,
        to: options.to ? cwd(options.to) : id,
        map: {
          inline: false,
          annotation: false
        },
        parser: options.parser
      };
      return postcss(options.plugins || []).process(code, opts).then(function (result) {
        var code = void 0,
            map = void 0;
        if (combineStyleTags || extract) {
          concat.add(result.opts.from, result.css, result.map && result.map.toString());
          code = 'export default ' + JSON.stringify(getExport(result.opts.from)) + ';';
          map = { mappings: '' };
        } else {
          code = 'export default ' + injectFnName + '(' + JSON.stringify(result.css) + ',' + JSON.stringify(getExport(result.opts.from)) + ');';
          map = options.sourceMap && result.map ? JSON.parse(result.map) : { mappings: '' };
        }

        return { code: code, map: map };
      });
    },
    onwrite: function onwrite(opts) {
      if (extract) {
        return extractCssAndWriteToFile(concat, extractPath, opts.dest, options.sourceMap);
      }
    }
  };
};

module.exports = index;
