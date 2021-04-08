module.exports = {
  platform: 'wechat',
  src: 'src',
  dist: 'dist',
  npmPath: 'miniprogram_npm',
  componentKey: 'usingComponents',
  transformers: [
    {
      prefix: 'van-',
      getComponentPath: (componentName) => {
        return `@vant/weapp/${componentName}/index`
      }
    }
  ]
}
