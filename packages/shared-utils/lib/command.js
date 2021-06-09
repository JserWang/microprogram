const { execSync } = require('child_process')
const pkgDir = require('pkg-dir')
const execa = require('execa')
const chalk = require('chalk')

let _hasYarn

exports.hasYarn = () => {
  if (_hasYarn != null) {
    return _hasYarn
  }
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return (_hasYarn = true)
  } catch (e) {
    return (_hasYarn = false)
  }
}

exports.runNpmScript = async function (task, additonalArgs) {
  const projectRoot = await pkgDir(process.cwd())

  const args = [task, ...additonalArgs]

  const pm = exports.hasYarn() ? 'yarn' : 'npm'

  const command = chalk.dim(`${pm} ${args.join(' ')}`)
  console.log(`Running ${command}`)

  return execa(pm, args, { cwd: projectRoot, stdio: 'inherit' })
}
