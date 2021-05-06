const path = require('path')
const { MockDataResolver } = require('ts-mock-generator')
const { info } = require('@microprogram/shared-utils')

let mockData = {}

const getOrGenerateMockData = (opts) => {
  const mockDataResolver = new MockDataResolver({
    configPath: path.join(process.cwd(), 'tsconfig.json'),
    basePath: path.join(process.cwd(), opts.basePath),
    mockDir: opts.mockDir ? path.join(process.cwd(), opts.mockDir) : undefined,
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
      const targetMockData = mockData.filter((data) => data.url === url)
      if (targetMockData.length > 0) {
        const data = targetMockData[0]
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
