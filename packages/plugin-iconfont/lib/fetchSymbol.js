const axios = require('axios')
const { info, error } = require('@microprogram/shared-utils')
const parser = require('fast-xml-parser')

exports.fetchSymbol = async function (url) {
  info(`Starting fetch symbol from "${url}"`)

  try {
    const { data } = await axios.get(url)
    const matches = String(data).match(/'<svg>(.+?)<\/svg>'/)
    if (matches) {
      return new Promise((resolve) => {
        const parsed = parser.parse(`<svg>${matches[1]}</svg>`, {
          ignoreAttributes: false,
          attributeNamePrefix: '@_'
        })

        resolve(parsed)
      })
    }
    throw new Error(`Unknown symbol url: "${url}"`)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
}
