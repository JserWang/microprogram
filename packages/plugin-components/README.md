# @microprogram/plugin-wxapp-components

## Install

```bash
# yarn
yarn add @microprogram/plugin-components
```

## Usage

in gulpfile.js

```
const components = require('@microprogram/plugin-components');

return gulp.src(/path/to/miniprogramRoot + '**/*.wxml')
    .pipe(components({
      targetKey: "usingComponents",
      transformers: [
        {
          prefix: 'van-',
          getComponentPath: (componentName) => {
            return `@vant/weapp/${componentName}/index`
          }
        },
        {
          prefix: 'self-',
          getComponentPath: (componentName) => {
            return `../../components/${componentName}/index`
          }
        },
        {
          prefix: 'home-',
          getComponentPath: (componentName) => {
            return `./components/${componentName}/index`
          }
        }
      ]
    }))
    .pipe(gulp.dest(destPath))
```

### Example

The following is the original file content
`.wxml` file:

```html
<van-button>Button</van-button>
```

`.json` file:

```json
{
  "usingComponents": {}
}
```

When use this task, the json file will auto be changed to

```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index"
  }
}
```
