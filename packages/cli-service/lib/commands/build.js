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
    async function serve(args) {
      const task = require('../task')
      task.execute(['build'])
    }
  )
}
