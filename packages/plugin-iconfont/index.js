const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { info, error, done, resolveConfig, runNpmScript } = require('@microprogram/shared-utils')

const cwd = process.cwd()

module.exports = async function () {
  const { iconfont } = resolveConfig()
  const { url, dir, lint } = iconfont
  info(`Starting fetch data from "${url}"`)
  try {
    const response = await axios.get(url)
    const matches = String(response.data).match(/@font-face/)
    if (!matches) {
      throw new Error(`Unknown css url: "${url}"`)
    }

    const filePath = path.resolve(cwd, dir)
    fs.writeFileSync(filePath, response.data)
    done(`Write the data to "${filePath}"`)
    if (lint) {
      info('Start lint css')
      await runNpmScript('stylelint', [dir, '--fix'])
      done('Linted css')
    }
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
}
