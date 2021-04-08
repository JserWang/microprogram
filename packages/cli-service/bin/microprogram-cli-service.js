#!/usr/bin/env node

const { checkNodeVersion, error } = require('@microprogram/shared-utils')

const requiredVersion = require('../package.json').engines.node
checkNodeVersion(requiredVersion, '@microprogram/cli')

const Service = require('../lib/Service')
const service = new Service(process.cwd())

const rawArgv = process.argv.slice(2)
const args = require('minimist')(process.argv.slice(2))
const command = args._[0]

service.run(command, args, rawArgv).catch((err) => {
  error(err)
  process.exit(1)
})
