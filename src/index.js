import {
  createFilter
} from 'rollup-pluginutils';
import postcss from 'postcss';
import path from 'path';
import fs from 'fs';

let _logSuccess = function(msg, title) {
  var date = new Date;
  var time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  console.log('[' + time + ']', title || 'POSTCSS', "'" + '\x1b[32m' + msg + '\x1b[0m' + "'");
};

let noOp = function() {};

const styles = {};
let changes = 0;

function _postcss(styles, plugins, output, onDone) {
  _logSuccess('init');
  let r = "";
  let index = 0;
  let n = Object.keys(styles).length;
  for (var file in styles) {
    postcss(plugins)
      .process(styles[file] || '', {
        from: file,
        to: file
      })
      .then(function(result) {
        index += 1;
        r += result.css;
        if (index === n) {
          fs.writeFile(output, r, function(err) {
            if (err) {
              return console.log(err);
            }else{
              fs.stat(output, function(err, stat) {
                  _logSuccess(getSize(stat.size),'POSTCSS BUNDLE SIZE');
                  onDone();
              });
            }
          });
        }
      });
  }
}

function getSize (bytes) {
  return bytes < 10000
    ? bytes.toFixed(0) + ' B'
    : bytes < 1024000
    ? (bytes / 1024).toPrecision(3) + ' kB'
    : (bytes / 1024 / 1024).toPrecision(4) + ' MB'
}

export default function(options = {}, done) {
  if (typeof(done) != 'function') done = noOp;
  const filter = createFilter(options.include, options.exclude);
  const plugins = options.plugins || [];
  const extensions = options.extensions || ['.css', '.sss']
  const output = options.output || './style.css';
  let parse = true;
  if (options.parse != null) {
    parse = options.parse
  }

  return {
    ongenerate() {
      // No stylesheet needed
      if (!changes || parse === false) {
        done();
        return
      }
      changes = 0
      _postcss(styles, plugins, output, done)
    },
    transform(code, id) {
      if (!filter(id)) {
        return
      }
      if (parse) {
        if (extensions.indexOf(path.extname(id)) === -1) {
          return null;
        }
        // Keep track of every stylesheet
        // Check if it changed since last render
        if (styles[id] !== code && code != '') {
          styles[id] = code
          changes++
        }
        return 'export default null'
      } else {
        if (extensions.indexOf(path.extname(id)) > -1) {
          return 'export default null'
        }
      }
    }
  }
}