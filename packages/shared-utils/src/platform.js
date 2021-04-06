const PLATFORM = {
  UNKNOWN: 'unknown',
  WECHAT: 'wechat',
  ALIPAY: 'alipay'
}

exports.PLATFORM = PLATFORM

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
        return PLATFORM.WECHAT
      case '.axml':
        return PLATFORM.ALIPAY
      default:
        return PLATFORM.UNKNOWN
    }
  }

  return PLATFORM.UNKNOWN
}
