import {
  createFilter
} from 'rollup-pluginutils';
import postcss from 'postcss';
import path from 'path';
import fs from 'fs';

let bucket = [];

function _postcss(plugins, output) {
  let r = "";
  let index = 0;
  let n = bucket.length;
  for (var k in bucket) {
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
    let file = bucket[k];
    fs.readFile(file, 'utf8', cb(file));
  }
}

export default function(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const plugins = options.plugins || [];
  const extensions = options.extensions || ['.css', '.sss']
  const output = options.output || './style.css';
  let parse = true;
  if(options.parse != null){ parse = options.parse }

  return {
    intro() {
      _postcss(plugins, output)
    },
    transform(code, id) {
      if (!filter(id)) { return null }
      if (parse) { 
        if (extensions.indexOf(path.extname(id)) === -1) { return null; }
        bucket.push(id);
        return "export default null;"
      }else{
        if (extensions.indexOf(path.extname(id)) > -1) { return "export default null;" }
      }
    }
  }
}