'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var Concat = _interopDefault(require('concat-with-sourcemaps'));
var postcss = _interopDefault(require('postcss'));
var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));

var noOp = function () {};
var log = {
  success: function success(msg, title) {
    var date = new Date();
    var time = date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    console.log(
      "[" + time + "]",
      title || "POSTCSS",
      "'" + "\x1b[32m" + msg + "\x1b[0m" + "'"
    );
  },
  error: function error(msg, title) {
    var date = new Date();
    var time = date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    console.log("[" + time + "]", title || "POSTCSS", "\x1b[31m", msg, "\x1b[0m");
  }
};
var getSize = function (bytes) {
  return bytes < 10000
    ? bytes.toFixed(0) + " B"
    : bytes < 1024000
        ? (bytes / 1024).toPrecision(3) + " kB"
        : (bytes / 1024 / 1024).toPrecision(4) + " MB";
};

var styles = {};
var changes = 0;

function _postcss(styles, output, plugins, opts, onDone) {
  log.success("init");
  var concat = new Concat(opts.sourceMap, output, "\n");
  var index = 0;
  var n = Object.keys(styles).length;
  for (var id in styles) {
    postcss(plugins)
      .process(styles[id] || "", {
        from: id,
        to: id,
        map: (opts.sourceMap && {
          inline: false,
          annotation: false
        }) ||
          false,
        parser: opts.parser
      })
      .then(function (result) {
        concat.add(id, result.css, result.map && result.map.toString());
        index += 1;
        if (index === n) {
          var finalOutput = concat.content.toString("utf8");
          if (opts.sourceMap) {
            finalOutput += "\n/*# sourceMappingURL=" + output + ".map */";
            fs.writeFile(output + ".map", concat.sourceMap);
          }
          fs.writeFile(output, finalOutput, function (writeErr) {
            if (writeErr) {
              log.error(writeErr);
            } else {
              fs.stat(output, function (err, stat) {
                if (err) {
                  log.error(err);
                } else {
                  log.success(getSize(stat.size), "POSTCSS BUNDLE SIZE");
                  onDone();
                }
              });
            }
          });
        }
      });
  }
}

var index = function(options, done) {
  if ( options === void 0 ) options = {};

  if (typeof done != "function") { done = noOp; }
  var filter = rollupPluginutils.createFilter(options.include, options.exclude);
  var plugins = options.plugins || [];
  var parser = options.parser || null;
  var extensions = options.extensions || [".css", ".sss"];
  var output = options.output || "./style.css";
  var sourceMap = options.sourceMap || false;
  var parse = true;
  if (options.parse != null) {
    parse = options.parse;
  }

  return {
    ongenerate: function ongenerate() {
      // No stylesheet needed
      if (!changes || parse === false) {
        done();
        return;
      }
      changes = 0;
      _postcss(styles, output, plugins, {sourceMap: sourceMap, parser: parser}, done);
    },
    transform: function transform(code, id) {
      if (!filter(id)) {
        return;
      }
      if (parse) {
        if (extensions.indexOf(path.extname(id)) === -1) {
          return null;
        }
        // Keep track of every stylesheet
        // Check if it changed since last render
        if (styles[id] !== code && code != "") {
          styles[id] = code;
          changes++;
        }
        return "export default null";
      } else {
        if (extensions.indexOf(path.extname(id)) > -1) {
          return "export default null";
        }
      }
    }
  };
};

module.exports = index;
