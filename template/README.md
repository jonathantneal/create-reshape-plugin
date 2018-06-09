# ${title} [<img src="http://jonathantneal.github.io/reshape-logo.svg" alt="reshape" width="90" height="90" align="right">][Reshape]

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Support Chat][git-img]][git-url]

[${title}] lets you do this in HTML.

```html
<example>

<!-- becomes -->

<example>
```

## Usage

Add [Reshape] and [${title}] to your build tool:

```bash
npm install reshape ${id} --save-dev
```

#### Node

Use [${title}] to process your HTML:

```js
import reshape from 'reshape';
import ${idCamelCase} from '${id}';

reshape({
  plugins: [ ${idCamelCase}(/* options */) ]
}).process(YOUR_HTML);
```

#### Webpack

Add [Reshape Loader] to your build tool:

```bash
npm install reshape-loader --save-dev
```

Use [${title}] in your Webpack configuration:

```js
import ${idCamelCase} from '${id}';

export default {
  module: {
    rules: [{
      test: /\.html$/,
      loader: 'reshape-loader',
      options: {
      plugins: [ ${idCamelCase}(/* options */) ]
    }
    }]
  }
}
```

[cli-url]: https://travis-ci.org/${user}/${id}
[cli-img]: https://img.shields.io/travis/${user}/${id}.svg
[git-img]: https://img.shields.io/badge/support-chat-blue.svg
[git-url]: https://gitter.im/reshape/reshape
[npm-url]: https://www.npmjs.com/package/${id}
[npm-img]: https://img.shields.io/npm/v/${id}.svg

[Reshape]: https://github.com/reshape/reshape
[Reshape Loader]: https://github.com/reshape/loader
[${title}]: https://github.com/${user}/${id}
