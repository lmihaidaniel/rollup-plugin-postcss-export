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
      output: './style.css',
      parse: true // default true, when set to false the imported style files are ignored in the rollup flow
    })
  ]
}).then(...)
```

**entry**

```javascript
import '/path/to/some_random_file.css'
```


## License

MIT &copy; [lmihaidaniel](https://github.com/lmihaidaniel)
