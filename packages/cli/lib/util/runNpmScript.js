const pkgDir = require('pkg-dir')
const execa = require('execa')
const chalk = require('chalk')
const { hasYarn } = require('@microprogram/shared-utils')

module.exports = async function runNpmScript(task, additonalArgs) {
  const projectRoot = await pkgDir(process.cwd())

  const args = [task, ...additonalArgs]

  const pm = hasYarn() ? 'yarn' : 'npm'

  const command = chalk.dim(`${pm} ${args.join(' ')}`)
  console.log(`Running ${command}`)

  return await execa(pm, args, { cwd: projectRoot, stdio: 'inherit' })
}
