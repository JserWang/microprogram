const { error } = require('@microprogram/shared-utils')
const PluginAPI = require('./PluginAPI')

module.exports = class Service {
  constructor(context) {
    this.initialized = false
    this.context = context
    this.commands = {}
    this.plugins = this.resolvePlugins()
  }

  init(mode) {
    if (this.initialized) {
      return
    }
    this.initialized = true
    this.mode = mode

    this.plugins.forEach(({ id, apply }) => apply(new PluginAPI(id, this)))
  }

  run(name, args = {}, rawArgv = []) {
    const mode = args.mode || 'development'

    this.init(mode)

    args._ = args._ || []
    let command = this.commands[name]
    if (!command && name) {
      error(`command "${name}" does not exist.`)
      process.exit(1)
    }
    if (!command || args.help || args.h) {
      command = this.commands.help
    } else {
      args._.shift() // remove command itself
      rawArgv.shift()
    }
    const { fn } = command
    return fn(args, rawArgv)
  }

  resolvePlugins() {
    const idToPlugin = (id) => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    })

    return ['./commands/serve', './commands/build'].map(idToPlugin)
  }
}
