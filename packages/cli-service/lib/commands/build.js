const argv = require('minimist')(process.argv.slice(2))

module.exports = (api) => {
  api.registerCommand(
    'build',
    {
      description: 'build for production',
      usage: 'microprogram-cli-service build [options] [entry]',
      options: {
        '--no-clean': `do not remove the dist directory before building the project`
      }
    },
    async function serve() {
      process.env.NODE_ENV = argv.mode
      const task = require('../task')
      task.execute(['build'])
    }
  )
}
