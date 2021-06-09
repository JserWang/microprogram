#!/usr/bin/env node
const chalk = require('chalk')
const { program } = require('commander')
const { checkNodeVersion, runNpmScript } = require('@microprogram/shared-utils')
const leven = require('leven')

const requiredVersion = require('../package.json').engines.node
checkNodeVersion(requiredVersion, '@microprogram/cli')

program
  .version(`@microprogram/cli ${require('../package.json').version}`)
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('create a new project')
  .action(() => {})

program
  .command('add [template]')
  .allowUnknownOption()
  .option('-t, --target <targetPath>', 'Generate file target path')
  .option('-p, --page <pageName>', 'Generate page files to target path')
  .option(
    '-c, --component <componentName>',
    'Generate component files to target path'
  )
  .description('Generate component or files to target path')
  .action((template) => {
    require('@microprogram/create')(template).catch((e) => {
      console.error(e)
    })
  })

program
  .command('devtool [command]')
  .allowUnknownOption()
  .description('Run devtool cli command')
  .action(() => {
    require(`@microprogram/plugin-devtool`).execute(
      ...process.argv.slice(3)
    )
  })

program
  .command('dev')
  .description('alias of "npm run dev" in the current project')
  .allowUnknownOption()
  .action(() => {
    runNpmScript('dev', process.argv.slice(3))
  })

program
  .command('build')
  .description('alias of "npm run build" in the current project')
  .option('-m, --mode', 'Set build mode. When the mode is in production, it will be compressed')
  .action(() => {
    runNpmScript('build', process.argv.slice(3))
  })

program
  .command('icon')
  .description('generate icon from iconfont.cn')
  .action(() => {
    require('@microprogram/plugin-iconfont')()
  })

// output help information on unknown commands
program.arguments('<command>').action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  suggestCommands(cmd)
  process.exitCode = 1
})

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(
    `  Run ${chalk.cyan(
      `mp <command> --help`
    )} for detailed usage of given command.`
  )
  console.log()
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

// enhance common error messages
const enhanceErrorMessages = require('../lib/util/enhanceErrorMessages.js')

enhanceErrorMessages('missingArgument', (argName) => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', (optionName) => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return (
    `Missing required argument for option ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : ``)
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map((cmd) => cmd._name)

  let suggestion

  availableCommands.forEach((cmd) => {
    const isBestMatch =
      leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}
