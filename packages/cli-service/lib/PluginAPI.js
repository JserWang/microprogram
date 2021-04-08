const path = require('path')

class PluginAPI {
  constructor(id, service) {
    this.id = id
    this.service = service
  }

  /**
   * Resolve path for a project.
   *
   * @param {string} _path - Relative path from project root
   * @return {string} The resolved absolute path.
   */
  resolve(_path) {
    return path.resolve(this.service.context, _path)
  }

  /**
   * Register a command that will become available as `microprogram-cli-service [name]`
   * @param {*} name
   * @param {*} opts
   * @param {*} fn
   */
  registerCommand(name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = null
    }
    this.service.commands[name] = { fn, opts: opts || {} }
  }
}

module.exports = PluginAPI
