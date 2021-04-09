const path = require('path')
const rm = require('rimraf')
const { info, done } = require('@microprogram/shared-utils')

const cwd = process.cwd()

exports.build = function (config) {
  const { path: configPath } = config
  return function (cb) {
    info(`Clean "${configPath.dist}"`)
    rm(path.resolve(cwd, `${configPath.dist}`), () => {
      done(`Successfully cleaned!`)
      cb()
    })
  }
}
