const { fetchSymbol } = require('./lib/fetchSymbol')
const { resolveConfig } = require('@microprogram/shared-utils')

const { platform, iconfont = {} } = resolveConfig()

module.exports = function () {
  fetchSymbol(iconfont.url).then((res) => {
    require(`./generator/${platform}`)(res, iconfont)
  })
}
