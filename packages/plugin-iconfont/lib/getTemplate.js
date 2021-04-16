const fs = require('fs')
const path = require('path')

exports.getTemplate = function (fileName) {
  return fs
    .readFileSync(path.join(__dirname, `../templates/${fileName}.template`))
    .toString()
}
