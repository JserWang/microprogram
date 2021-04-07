;['command', 'file', 'logger', 'node', 'platform'].forEach((m) => {
  Object.assign(exports, require(`./lib/${m}`))
})
