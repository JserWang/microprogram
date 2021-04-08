const path = require('path')
const rm = require('rimraf')
const { info, done } = require('@microprogram/shared-utils')

exports.build = function (config) {
  return function (cb) {
    const projectJson = path.join(config.dist, 'project.config.json')
    info(`Clean "${config.dist}"`)
    rm(
      path.resolve(process.cwd(), `${config.dist}`),
      {
        glob: {
          ignore: [projectJson]
        }
      },
      () => {
        done(`Successfully cleaned!`)
        cb()
      }
    )
  }
}
