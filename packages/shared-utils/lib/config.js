const fs = require('fs')

exports.resolveConfig = function () {
  const cwd = process.cwd()
  let config = {}
  if (fs.existsSync(`${cwd}/microprogram.config.js`)) {
    config = require(`${cwd}/microprogram.config.js`)
  } else {
    error(`Cannot found "microprogram.config.js" in "${cwd}"`)
    process.exit(1)
  }

  return config
}
