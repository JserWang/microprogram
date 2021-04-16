exports.replaceSize = function (content, size) {
  return content.replace(/#size#/g, String(size))
}

exports.replaceNames = function (content, names) {
  return content.replace(/#names#/g, names.join(' | '))
}

exports.replaceHexToRgb = function (hex) {
  const rgb = []

  //去除前缀 # 号
  hex = hex.substr(1)

  if (hex.length === 3) {
    // 处理 '#abc' 成 '#aabbcc'
    hex = hex.replace(/(.)/g, '$1$1')
  }

  hex.replace(/../g, (color) => {
    // 按16进制将字符串转换为数字
    rgb.push(parseInt(color, 0x10))

    return color
  })

  return 'rgb(' + rgb.join(',') + ')'
}

exports.replaceIsRpx = (content, useRpx) => {
  return content
    .replace(/#rpx-1:(.+?):#/g, useRpx ? '$1' : '')
    .replace(/#rpx-0:(.+?):#/g, useRpx ? '' : '$1')
}
