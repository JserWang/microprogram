'use strict'

const fs = require('fs')
const path = require('path')
const through = require('through2')
const parser = require('fast-xml-parser')
const PluginError = require('plugin-error')

function plugin(options) {
  options = options || {
    targetKey: 'usingComponents',
    transformers: []
  }

  return through.obj(function (chunk, _, cb) {
    if (chunk.isNull()) {
      return cb()
    }

    if (chunk.isStream()) {
      this.emit(
        'error',
        new PluginError('@microprogram/plugin-components', 'Stream not support')
      )
      return cb()
    }

    if (options.transformers.length === 0) {
      return cb()
    }

    const parsedPath = parsePath(chunk.relative)
    const parsedFile = parser.parse(chunk.contents.toString())
    const tags = getTagNames(parsedFile)

    const jsonFilePath = path.join(
      chunk.base,
      parsedPath.dirname,
      `${parsedPath.basename}.json`
    )

    const json = require(jsonFilePath)
    // empty json target key
    json[`${options.targetKey}`] = {}

    options.transformers.forEach((transformer) => {
      const targetTags = tags.filter((tag) =>
        tag.startsWith(transformer.prefix)
      )

      targetTags.forEach((tag) => {
        const componentName = tag.slice(transformer.prefix.length)
        json[`${options.targetKey}`][tag] = transformer.getComponentPath(
          componentName
        )
      })
    })

    fs.writeFileSync(jsonFilePath, JSON.stringify(json, null, 2))

    return cb(null, chunk)
  })
}

function parsePath(filePath) {
  return {
    dirname: path.dirname(filePath),
    basename: path.basename(filePath, path.extname(filePath))
  }
}

function getTagNames(element) {
  let result = []
  Object.keys(element).forEach((tagName) => {
    const children = element[tagName]
    if (Array.isArray(children)) {
      children.forEach(function (child) {
        result = result.concat(getTagNames(child))
      })
    } else if (typeof children === 'object') {
      result = result.concat(getTagNames(children))
    }
    result.push(tagName)
  })
  return Array.from(new Set(result))
}

module.exports = plugin
