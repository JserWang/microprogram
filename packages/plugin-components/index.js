'use strict'

const fs = require('fs')
const path = require('path')
const through = require('through2')
const parser = require('fast-xml-parser')
const PluginError = require('plugin-error')
const { readJsonFile } = require('@microprogram/shared-utils')

const attrsKey = '@attrs'
const genericPrefix = 'generic:'

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
    const parsedFile = parser.parse(chunk.contents.toString(), {attrNodeName: attrsKey, attributeNamePrefix: '', ignoreAttributes: false})

    const tags = getTagNames(parsedFile)

    const jsonFilePath = path.join(
      chunk.base,
      parsedPath.dirname,
      `${parsedPath.basename}.json`
    )
    const json = readJsonFile(jsonFilePath) || {}
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

function getTagNames(elements) {
  let result = []
  Object.keys(elements).filter(tagName => !tagName.startsWith(attrsKey)).forEach((tagName) => {
    const element = elements[tagName]

    if (Array.isArray(element)) {
      element.forEach(function (child) {
        result = result.concat(getTagNames(child))
      })
    } else if (typeof element === 'object') {
      result = result.concat(getTagNames(element))
    }

    if (element[attrsKey]) {
    // generic
      result = result.concat(Object.keys(element[attrsKey]).filter(key => key.startsWith(genericPrefix)).map(key => element[attrsKey][key]))
    }

    result.push(tagName)
  })

  return Array.from(new Set(result))
}

module.exports = plugin
