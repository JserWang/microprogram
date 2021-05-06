const os = require('os')
const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite')
const { execSync, execFile } = require('child_process')
const { error, info, done } = require('@microprogram/shared-utils')
const glob = require('fast-glob')

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

function checkCliStatus() {
  let status
  switch(os.platform()) {
    case 'darwin':
      const result = glob.sync(`${process.env.HOME}/Library/Application Support/微信开发者工具/**/**/.ide-status`)
      if (result.length > 0) {
        status = fs.readFileSync(result[0]).toString() === 'On'
      }
      break;
    case 'win32':
    default:
      status = undefined
  }
  return status
}

function injectProject(args) {
  if (args.indexOf(args) > -1) {
    return args
  } else {
    args.push('--project')
    args.push(`${process.cwd()}`)
  }
  return args
}

exports.execute = function (args) {
  const cliPath = getCliPath()
  if (cliPath) {
    const status = checkCliStatus()
    if (status === undefined || status) {
      args = injectProject(args)
      info(`${cliPath} ${args.join(' ')}`, 'DEVTOOL')
      return execFile(cliPath, args, { timeout: 150000 }, (error) => {
        if (error) {
          error(error, 'DEVTOOL')
        } else {
          done(`${args.join(' ')}`, 'DEVTOOL')
        }
      })
    } else {
      error(`Please open devtool serve port. "设置 -> 安全设置中开启服务端口"`)
    }
  } else {
    error(`Please download the devtool from \n https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html`)
  }
}
