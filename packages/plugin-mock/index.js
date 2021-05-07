const path = require('path')
const fs = require('fs')
const { MockDataResolver } = require('ts-mock-generator')
const { info, readJsonFile } = require('@microprogram/shared-utils')

let mockData = {}

const cwd = process.cwd()

function hasTsConfig() {
  return fs.existsSync(path.join(cwd, 'tsconfig.json'))
}

const getOrGenerateMockData = (opts) => {
  //
  if (hasTsConfig()) {
    const mockDataResolver = new MockDataResolver({
      configPath: path.join(cwd, 'tsconfig.json'),
      basePath: path.join(cwd, opts.basePath),
      mockDir: opts.mockDir ? path.join(cwd, opts.mockDir) : undefined,
      includes: opts.includes || []
    })
  
    mockData = mockDataResolver.getOrGenerateData()
  
    if (opts.watchFile) {
      mockDataResolver.watchMockFile((data) => {
        mockData = data
      })
      mockDataResolver.watchRequestFile((data) => {
        mockData = data
      })
    }
  } else {
    const mockDir = path.join(cwd, opts.mockDir, 'mock.json')
    if (fs.existsSync(mockDir)) {
      require('node-watch')(mockDir, () => {
        mockData = readJsonFile(mockDir) || []
      })
    }
  }
}

const sleep = (delay) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, delay)
  })

module.exports = function (options) {
  const prefix = options.prefix
  getOrGenerateMockData(options)

  return async (ctx, next) => {
    if (ctx.request.path.startsWith(prefix)) {
      const url = ctx.request.path.split('?')[0].slice(prefix.length)
      const targetMockData = mockData.find((data) => data.url === url)
      if (targetMockData) {
        const data = targetMockData
        if (data.timeout) {
          await sleep(data.timeout)
        }
        ctx.type = 'application/json'
        ctx.response.status = data.httpCode ? data.httpCode : 200
        ctx.body = data.response
        info(JSON.stringify(data.response), `MOCK: ${url}`)
      }
    }
    next()
  }
}
