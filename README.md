# rollup-plugin-postcss-export

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

Seamless integration between [Rollup](https://github.com/rollup/rollup) and [PostCSS](https://github.com/postcss/postcss), with export to file option;

Based on [rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss) by [egoist](https://github.com/egoist)

## Installation

```bash
npm install rollup-plugin-postcss-export
```

## Example

**config**

```javascript
import { rollup } from 'rollup';
import postcss from 'rollup-plugin-postcss-export';

rollup({
  entry: 'main.js',
  plugins: [
    postcss({
      plugins: [
        // cssnext(),
        // yourPostcssPlugin()
      ],
      extensions: ['.css', '.sss']  // default value
      // parser: sugarss
    })
  ]
}).then(...)
```

**entry**

```javascript
import '/path/to/some_random_file.css'
```

## Use with CSS modules

The [postcss-modules](https://github.com/css-modules/postcss-modules) plugin allows you to use CSS modules in PostCSS, it requires some additional setup to use in Rollup:

```js
import postcss from 'rollup-plugin-postcss';
import postcssModules from 'postcss-modules';

const cssExportMap = {};

rollup({
 plugins: [
    postcss({
      plugins: [
        postcssModules({
          getJSON (id, exportTokens) {
            cssExportMap[id] = exportTokens;
          }
        })
      ],
      getExport (id) {
        return cssExportMap[id];
      }
    })
 ]
})
```

You can now use CSS modules and import CSS like this:

```js
import style from './style.css';

console.log(style.className); // .className_echwj_1
```

To export the output CSS to a file pass the output parameter in the options:

```js
...
rollup({
 plugins: [
    postcss({
      plugins: [...],
      output: '/dist/bundle.css',
      reverse: true, //(optional) reverse the orded of css block imported for the output
    })
  ]
})
...
```

## License

MIT &copy; [egoist](https://github.com/egoist), [lmihaidaniel](https://github.com/lmihaidaniel)
