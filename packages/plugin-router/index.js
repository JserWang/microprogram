'use strict'

const { readJsonFile } = require('@microprogram/shared-utils')
const fs = require('fs')
const path = require('path')
const through = require('through2')
const traverse = require('@babel/traverse').default
const parse = require('@babel/parser').parse

const cwd = process.cwd()

function rewritePrivateConfig(pages) {
  const privateJsonPath = path.resolve(cwd, 'project.private.config.json')
  if (fs.existsSync(privateJsonPath)) {
    const privateJson = readJsonFile(privateJsonPath)

    // filter non-existent paths
    const pureList = privateJson.condition.miniprogram.list.filter((item) => pages.indexOf(item.pathName) !== -1)

    function hasSamePath(page) {
      return pureList.find(item => item.pathName === page)
    }

    pages.forEach((page) => {
      if (!hasSamePath(page)) {
        pureList.push({
          "name": page.replace('pages/', '').replace('/index', ''),
          "pathName": page,
          "query": "",
          "scene": null
        })
      }
    })

    privateJson.condition.miniprogram.list = pureList

    fs.writeFileSync(privateJsonPath, JSON.stringify(privateJson, null, 2))
  }
}

function plugin(jsonPath, config) {
  const { platform, plugins } = config
  const { autoGenPrivateConfig } = plugins.router

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

    let pages = []
    const subPackages = {}
    traverse(ast, {
      ArrayExpression: function (traversePath) {
        const elements = traversePath.node.elements
        for ( let index = 0; index < elements.length; index += 1) {
          const element = elements[index]
          if (element.type !== 'ObjectExpression') {
            return
          }

          const grand = traversePath.parentPath.parentPath.node
          const prop = element.properties.find((p) => p.key.name === 'page')

          if (grand.type === "ObjectExpression") {
            const subPackage = grand.properties.find((p) => p.key.name === 'root')
            if (subPackage) {
              const subPackageName = subPackage.value.value
              if (!subPackages[subPackageName]) {
                subPackages[subPackageName] = []
              }
              subPackages[subPackageName].push(prop.value.value)
            }
          } else {
            if (prop && prop.value.value) {
              pages.push(prop.value.value)
            }
          }
        }
      }
    })

    pages = Array.from(new Set(pages))
    if (pages.length > 0 || Object.keys(subPackages).length > 0) {
      const appJsonPath = path.resolve(cwd, jsonPath)

      // rewrite app.json
      var json = readJsonFile(appJsonPath) || {}
      json.pages = pages
      // 当存在分包时处理分包
      if (Object.keys(subPackages).length > 0) {
        let subKey = 'subpackages'
        if (platform === 'alipay') {
          subKey = 'subPackages'
        }
        json[subKey] = Object.keys(subPackages).map((key) => ({
          root: key,
          pages: subPackages[key]
        }))
      }
      fs.writeFileSync(appJsonPath, JSON.stringify(json, null, 2))

      // rewrite project.private.config.json
      autoGenPrivateConfig && rewritePrivateConfig(pages)
    }

    return cb(null, chunk)
  })
}

module.exports = plugin
