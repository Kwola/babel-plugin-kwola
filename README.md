# babel-plugin-kwola

Plugin to instrument a JS application to be analyzed by kwola.

## Example

**In**

```js
// input code
```

**Out**

```js
"use strict";

// output code
```

## Installation

```sh
$ npm install babel-plugin-kwola
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["kwola"]
}
```

### Via CLI

```sh
$ babel --plugins kwola script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["kwola"]
});
```
