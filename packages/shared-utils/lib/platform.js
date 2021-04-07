exports.PLATFORM = {
  UNKNOWN: 'unknown',
  WECHAT: 'wechat',
  ALIPAY: 'alipay'
}

/**
 * Get platform by file extension name
 * @returns platform
 */
exports.getPlatform = function () {
  const fg = require('fast-glob')
  const path = require('path')
  const entries = fg.sync(['*.wxml', '*.axml'], { baseNameMatch: true })

  if (entries.length > 0) {
    const entry = entries[0]
    const extname = path.extname(entry)
    switch (extname) {
      case '.wxml':
        return exports.PLATFORM.WECHAT
      case '.axml':
        return exports.PLATFORM.ALIPAY
      default:
        return exports.PLATFORM.UNKNOWN
    }
  }

  return exports.PLATFORM.UNKNOWN
}
