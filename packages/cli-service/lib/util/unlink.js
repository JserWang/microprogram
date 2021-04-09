const rm = require('rimraf')
const { done } = require('@microprogram/shared-utils')

module.exports = function ({ file, fromPath, toPath, tag, extname }) {
  let toFile = file.replace(fromPath, toPath)
  if (extname) {
    toFile = toFile.replace(/\.\w*$/, extname)
  }
  rm(toFile, { maxBusyTries: 5 }, function (err) {
    if (!err) {
      done(toFile, `Deleted ${tag}`)
    }
  })
}
