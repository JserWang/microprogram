const gulp = require('gulp')
const {
  info,
  error,
  done,
  PLATFORM_EXT
} = require('@microprogram/shared-utils')
const fs = require('fs')

const cwd = process.cwd()
let config = {}
if (fs.existsSync(`${cwd}/microprogram.config.js`)) {
  config = require(`${cwd}/microprogram.config.js`)
} else {
  error(`Cannot found "microprogram.config.js" in "${cwd}"`)
  process.exit(1)
}

const viewExt = PLATFORM_EXT[config.platform].viewExt

gulp.task('clean', require('./tasks/clean').build(config))
gulp.task('typescript', require('./tasks/typescript').build(config))
gulp.task(
  'json',
  require('./tasks/copy').build(config, `./${config.src}/**/*.json`)
)
gulp.task('less', require('./tasks/less').build(config))
gulp.task('wxml', require('./tasks/wxml').build(config))
gulp.task(
  'image',
  require('./tasks/copy').build(config, `./${config.src}/**/*.png`)
)
gulp.task(
  'npm',
  require('./tasks/copy').build(
    config,
    `./${config.npmPath}/**`,
    `./${config.dist}/${config.npmPath}`
  )
)

gulp.task('ts-watch', require('./tasks/typescript').watch(config))
gulp.task('less-watch', require('./tasks/less').watch(config))
gulp.task('wxml-watch', require('./tasks/wxml').watch(config))
gulp.task(
  'json-watch',
  require('./tasks/copy').watch(config, `./${config.src}/**/*.json`)
)
gulp.task(
  'image-watch',
  require('./tasks/copy').watch(config, `./${config.src}/**/*.png`)
)
gulp.task(
  'npm-watch',
  require('./tasks/copy').watch(
    config,
    `./${config.npmPath}/**`,
    `./${config.dist}/${config.npmPath}`
  )
)

gulp.task(
  'watch',
  gulp.series(
    gulp.parallel(
      'ts-watch',
      'less-watch',
      `${viewExt}-watch`,
      `json-watch`,
      'image-watch',
      'npm-watch'
    ),
    (cb) => {
      done('All watch tasks started !')
      cb()
    }
  )
)

gulp.task(
  'compile',
  gulp.series(
    (cb) => {
      info('Starting compile')
      cb()
    },
    gulp.parallel('npm', 'image', 'less', 'typescript', `${viewExt}`, 'json'),
    (cb) => {
      done('Compiled successfully!')
      cb()
    }
  )
)

gulp.task('dev', gulp.series('clean', 'compile', 'watch'))

gulp.task('build', gulp.series('clean', 'compile'))

gulp.on('error', error)

exports.execute = function (tasks, cb) {
  gulp.series(tasks)(function (err) {
    if (err) {
      error(err)
      throw err
    }
    cb()
  })
}
