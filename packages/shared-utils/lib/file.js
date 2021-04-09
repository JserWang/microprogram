const fs = require('fs')
const path = require('path')

exports.copy = function (src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    exports.copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

exports.copyDir = function (srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    exports.copy(srcFile, destFile)
  }
}

exports.emptyDir = function (dir) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file)
    // baseline is Node 12 so can't use rmSync :(
    if (fs.lstatSync(abs).isDirectory()) {
      exports.emptyDir(abs)
      fs.rmdirSync(abs)
    } else {
      fs.unlinkSync(abs)
    }
  }
}

/**
 *
 * @param { string } dir
 * @param { string[] } formats
 * @param { boolean } pathOnly
 * @returns
 */
exports.lookupFile = function (dir, formats, pathOnly = false) {
  for (const format of formats) {
    const fullPath = path.join(dir, format)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
    }
  }
  const parentDir = path.dirname(dir)
  if (parentDir !== dir) {
    return exports.lookupFile(parentDir, formats, pathOnly)
  }
}

exports.readJsonFile = function (jsonPath) {
  if (fs.existsSync(jsonPath)) {
    const content = fs.readFileSync(jsonFilePath, 'utf-8').trim()
    try {
      return JSON.parse(content)
    } catch (e) {}
  }
  return null
}
