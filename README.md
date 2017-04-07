# rollup-plugin-postcss-export

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

Seamless integration between [Rollup](https://github.com/rollup/rollup) and [PostCSS](https://github.com/postcss/postcss), witch process the styles and bundle them into 1 external css file;


## Installation

```bash
npm install rollup-plugin-postcss-export
```

## Rollup import example

Use rollup import system to import styles that will be later processed by rollup. The processed style are concatenated and exported into a single external file

**config**

```javascript
import { rollup } from 'rollup';
import postcss from 'rollup-plugin-postcss-export';

rollup({
  entry: 'main.js',
  plugins: [
    postcss({
      extensions: ['.css', '.sss']  // default value
      plugins: [
        // cssnext(),
        // yourPostcssPlugin()
      ],
      sourceMap: true, // defult false
      export: './style.css', // default false
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

That's it, you can now use CSS modules and import CSS like this:

```js
import style from './style.css';

console.log(style.className); // .className_echwj_1
```

## License

MIT &copy; [lmihaidaniel](https://github.com/lmihaidaniel)
