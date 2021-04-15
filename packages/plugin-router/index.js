'use strict'

const { readJsonFile } = require('@microprogram/shared-utils')
const fs = require('fs')
const path = require('path')
const through = require('through2')
const traverse = require('@babel/traverse').default
const parse = require('@babel/parser').parse

const cwd = process.cwd()

function plugin(jsonPath) {
  return through.obj(function (chunk, _, cb) {
    if (chunk.isNull()) {
      return cb()
    }
    const routerFilePath = path.join(chunk.base, chunk.relative)
    const context = fs.readFileSync(routerFilePath)
    const ast = parse(context.toString(), {
      sourceType: 'module',
      plugins: ['typescript']
    })

    let allPath = []
    traverse(ast, {
      ArrayExpression: function (traversePath) {
        for (
          let index = 0;
          index < traversePath.node.elements.length;
          index++
        ) {
          const element = traversePath.node.elements[index]
          if (element.type !== 'ObjectExpression') {
            return
          }
          const prop = element.properties.find((p) => p.key.name === 'path')
          if (prop) {
            allPath.push(prop.value.value)
          }
        }
      }
    })

    allPath = Array.from(new Set(allPath))
    if (allPath.length > 0) {
      const appJsonPath = path.resolve(cwd, jsonPath)

      var json = readJsonFile(appJsonPath) || {}
      json.pages = allPath
      fs.writeFileSync(appJsonPath, JSON.stringify(json, null, 2))
    }

    return cb(null, chunk)
  })
}

module.exports = plugin
