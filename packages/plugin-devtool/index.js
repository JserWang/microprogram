const { resolveConfig } = require('@microprogram/shared-utils')

exports.execute = function (...args) {
  const config = resolveConfig()
  require(`./${config.platform}`).execute(args)
}
