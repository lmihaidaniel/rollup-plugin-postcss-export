import {
  createFilter
} from 'rollup-pluginutils';
import postcss from 'postcss';
import Concat from 'concat-with-sourcemaps';
import styleInject from 'style-inject';
import path from 'path';
import fs from 'fs';

let rx = /\@style(.+)\n/g;
let bucket = [];

function _postcss(plugins, output) {
  let r = "";
  let index = 0;
  let n = bucket.length;
  for (var k in bucket) {
    let file = bucket[k];
    let cb = function(f) {
      return function(err, data) {
        if (!err) {
          postcss(plugins)
            .process(data, {
              from: f,
              to: f
            })
            .then(function(result) {
              index += 1;
              r += result.css;
              if (index === n) {
                fs.writeFile(output, r, function(err) {
                  if (err) {
                    return console.log(err);
                  }
                });
                bucket = [];
              }
            });
        }
      }
    }
    fs.readFile(file, 'utf8', cb(file));
  }
}

function cwd(file) {
  return path.join(process.cwd(), file);
}

export default function(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const plugins = options.plugins || [];
  const injectFnName = '__$styleInject';
  const extensions = options.extensions || ['.css', '.sss']
  const getExport = options.getExport || function() {}
  const combineStyleTags = !!options.combineStyleTags;
  const output = options.output;

  const concat = new Concat(true, 'styles.css', '\n');

  const injectStyleFuncCode = styleInject.toString().replace(/styleInject/, injectFnName);

  return {
    intro() {
      if (output) {
        _postcss(plugins, output)
      } else {
        if (combineStyleTags) {
          return `${injectStyleFuncCode}\n${injectFnName}(${JSON.stringify(concat.content.toString('utf8'))})`;
        } else {
          return injectStyleFuncCode;
        }
      }
    },
    transform(code, id) {
      if (!filter(id)) return null
      if (output) {
        var arr = rx.exec(code);
        if (arr) {
          if (arr[1]) {
            bucket.push(path.resolve(path.dirname(id), arr[1].trim()));
          }
        }
      } else {
        if (extensions.indexOf(path.extname(id)) === -1) return null
        const opts = {
          from: options.from ? cwd(options.from) : id,
          to: options.to ? cwd(options.to) : id,
          map: {
            inline: false,
            annotation: false
          },
          parser: options.parser
        };
        return postcss(plugins)
          .process(code, opts)
          .then(result => {
            let code, map;
            if (combineStyleTags) {
              concat.add(result.opts.from, result.css, result.map && result.map.toString());
              code = `export default ${JSON.stringify(getExport(result.opts.from))};`;
              map = {
                mappings: ''
              };
            } else {
              code = `export default ${injectFnName}(${JSON.stringify(result.css)},${JSON.stringify(getExport(result.opts.from))});`;
              map = options.sourceMap && result.map ? JSON.parse(result.map) : {
                mappings: ''
              };
            }
            return {
              code,
              map
            };
          });
      }
    }
  }
}