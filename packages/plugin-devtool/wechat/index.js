const os = require('os')
const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite')
const { execSync, execFile } = require('child_process')
const { error } = require('@microprogram/shared-utils')

let cliPath

function getCliPath() {
  if (cliPath) {
    return cliPath
  }
  let wxPath = ''
  switch (os.platform()) {
    case 'darwin':
      const result = execSync(
        'defaults read com.tencent.webplusdevtools LastRunAppBundlePath'
      )
      if (result) {
        wxPath = `${result.toString('utf-8').trim()}/Contents/MacOS/cli`
      }
      break
    case 'win32':
      try {
        const encoding = 'cp936'
        const result = execSync(
          'REG QUERY "HKLM\\SOFTWARE\\Wow6432Node\\Tencent\\微信web开发者工具"',
          { encoding: 'buffer' }
        )
        const stdout = iconv.decode(result, encoding)
        if (stdout) {
          const stdoutArr = stdout.split('\r\n')
          let exePath = stdoutArr.find((p) => p.indexOf('.exe') != -1) || ''
          exePath =
            exePath.split('  ').find((p) => p.indexOf('.exe') != -1) || ''
          wxPath = path.join(path.dirname(exePath), 'cli.bat')
        }
      } catch (error) {}
      break
  }

  return (cliPath = fs.existsSync(wxPath) ? wxPath : null)
}

exports.execute = function (args) {
  const cliPath = getCliPath()
  if (cliPath) {
    return execFile(cliPath, args, { timeout: 150000 })
  } else {
    error(`Cannot find wechat devtool`)
  }
}
