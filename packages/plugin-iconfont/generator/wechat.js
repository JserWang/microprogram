const fs = require('fs')
const path = require('path')
const { emptyDir, done } = require('@microprogram/shared-utils')
const { getTemplate } = require('../lib/getTemplate')
const {
  replaceHexToRgb,
  replaceSize,
  replaceNames,
  replaceIsRpx
} = require('../lib/replace')

const cwd = process.cwd()

module.exports = function (data, config) {
  const fontDir = path.resolve(cwd, config.dir)
  const svgTemplates = []
  const fileName = 'index'
  const names = []

  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir)
  } else {
    emptyDir(fontDir)
  }

  const symbols = Array.isArray(data.svg.symbol)
    ? data.svg.symbol
    : [data.svg.symbol]

  symbols.forEach((item) => {
    const iconId = config.trimPrefix
      ? trimPrefix(item['@_id'], config.trimPrefix)
      : item['@_id']

    names.push(iconId)

    svgTemplates.push(
      `<!--${iconId}-->\n<view wx:if="{{name === '${iconId}'}}" style="background-image: url({{quot}}data:image/svg+xml, ${generateCase(
        item
      )}{{quot}});` +
        ' width: {{svgSize}}px; height: {{svgSize}}px; " class="icon" />'
    )

    done(`Generated icon "${iconId}"`)
  })

  fs.writeFileSync(
    path.join(fontDir, fileName + '.wxss'),
    getTemplate('wechat.wxss')
  )
  fs.writeFileSync(
    path.join(fontDir, fileName + '.wxml'),
    svgTemplates.join('\n\n')
  )

  let tsFile = getTemplate('wechat.ts')
  tsFile = replaceSize(tsFile, config.defaultSize)
  tsFile = replaceNames(tsFile, names)
  tsFile = replaceIsRpx(tsFile, config.useRpx)

  fs.writeFileSync(path.join(fontDir, fileName + '.ts'), tsFile)
  fs.writeFileSync(
    path.join(fontDir, fileName + '.json'),
    getTemplate('wechat.json')
  )
}

function trimPrefix(str, prefix) {
  return str.replace(new RegExp(`^${prefix}(.+?)$`), (_, value) =>
    value.replace(/^[-_.=+#@!~*]+(.+?)$/, '$1')
  )
}

function generateCase(data) {
  let template = `<svg viewBox='${data['@_viewBox']}' xmlns='http://www.w3.org/2000/svg' width='{{svgSize}}px' height='{{svgSize}}px'>`

  for (const domName of Object.keys(data)) {
    if (domName.startsWith('@_')) {
      continue
    }

    const counter = {
      colorIndex: 0
    }

    if (data[domName]) {
      template += `<${domName}${addAttribute(
        domName,
        data[domName],
        counter
      )} />`
    } else if (Array.isArray(data[domName])) {
      data[domName].forEach((sub) => {
        template += `<${domName}${addAttribute(domName, sub, counter)} />`
      })
    }
  }

  template += `</svg>`

  return template.replace(/<|>/g, (matched) => encodeURI(matched))
}

function addAttribute(domName, sub, counter) {
  let template = ''

  if (sub) {
    if (domName === 'path') {
      // Set default color same as in iconfont.cn
      // And create placeholder to inject color by user's behavior
      sub['@_fill'] = sub['@_fill'] || '#333'
    }

    for (const attributeName of Object.keys(sub)) {
      const formattedName = attributeName.replace('@_', '')
      if (attributeName === '@_fill') {
        const color = replaceHexToRgb(sub[attributeName])

        template += ` ${formattedName}='{{(isStr ? colors : colors[${counter.colorIndex}]) || '${color}'}}'`
        counter.colorIndex += 1
      } else {
        template += ` ${formattedName}='${sub[attributeName]}'`
      }
    }
  }

  return template
}
