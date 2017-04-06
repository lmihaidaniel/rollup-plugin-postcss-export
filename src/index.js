import { createFilter } from "rollup-pluginutils";
import { noOp, log, getSize } from "./utils";
import Concat from "concat-with-sourcemaps";
import postcss from "postcss";
import path from "path";
import fs from "fs";

const styles = {};
let changes = 0;

function _postcss(styles, output, plugins, opts, onDone) {
  log.success("init");
  const concat = new Concat(opts.sourceMap, output, "\n");
  let index = 0;
  let n = Object.keys(styles).length;
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
      .then(result => {
        concat.add(id, result.css, result.map && result.map.toString());
        index += 1;
        if (index === n) {
          let finalOutput = concat.content.toString("utf8");
          if (opts.sourceMap) {
            finalOutput += "\n/*# sourceMappingURL=" + output + ".map */";
            fs.writeFile(output + ".map", concat.sourceMap);
          }
          fs.writeFile(output, finalOutput, writeErr => {
            if (writeErr) {
              log.error(writeErr);
            } else {
              fs.stat(output, (err, stat) => {
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

export default function(options = {}, done) {
  if (typeof done != "function") done = noOp;
  const filter = createFilter(options.include, options.exclude);
  const plugins = options.plugins || [];
  const parser = options.parser || null;
  const extensions = options.extensions || [".css", ".sss"];
  const output = options.output || "./style.css";
  const sourceMap = options.sourceMap || false;
  let parse = true;
  if (options.parse != null) {
    parse = options.parse;
  }

  return {
    ongenerate() {
      // No stylesheet needed
      if (!changes || parse === false) {
        done();
        return;
      }
      changes = 0;
      _postcss(styles, output, plugins, {sourceMap, parser}, done);
    },
    transform(code, id) {
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
}
