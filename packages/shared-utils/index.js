;['command', 'file', 'node', 'platform'].forEach((m) => {
  Object.assign(exports, require(`./lib/${m}`))
})
