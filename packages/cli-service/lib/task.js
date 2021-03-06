const gulp = require('gulp')
const {
  info,
  error,
  done,
  resolveConfig
} = require('@microprogram/shared-utils')

const config = resolveConfig()

const { path: configPath } = config

gulp.task('clean', require('./tasks/clean').build(config))
gulp.task('typescript', require('./tasks/typescript').build(config))
gulp.task(
  'json',
  require('./tasks/copy').build(config, `./${configPath.src}/**/*.json`)
)
gulp.task('less', require('./tasks/less').build(config))
gulp.task('views', require('./tasks/views').build(config))
gulp.task(
  'image',
  require('./tasks/copy').build(config, `./${configPath.src}/**/*.png`)
)
gulp.task(
  'npm',
  require('./tasks/copy').build(
    config,
    `./${configPath.npm}/**`,
    `./${configPath.dist}/${configPath.npm}`
  )
)
gulp.task(
  'wxs',
  require('./tasks/copy').build(config, `./${configPath.src}/**/*.wxs`)
)
gulp.task('router', require('./tasks/router').build(config))

gulp.task('clearCache', (cb) => {
  require(`@microprogram/plugin-devtool`).execute(
    'cache',
    '--clean',
    'compile',
    'file'
  )
  cb()
})

gulp.task('ts-watch', require('./tasks/typescript').watch(config))
gulp.task('less-watch', require('./tasks/less').watch(config))
gulp.task('views-watch', require('./tasks/views').watch(config))
gulp.task(
  'json-watch',
  require('./tasks/copy').watch({
    config, 
    src: `./${configPath.src}/**/*.json`,
    find: configPath.src,
    replacement: configPath.dist
  })
)
gulp.task(
  'image-watch',
  require('./tasks/copy').watch({
    config, 
    src: `./${configPath.src}/**/*.png`,
    find: configPath.src,
    replacement: configPath.dist
  })
)
gulp.task(
  'npm-watch',
  require('./tasks/copy').watch({
    config,
    src: `./${configPath.npm}/**`,
    find: configPath.npm,
    replacement: `${configPath.dist}/${configPath.npm}`
  })
)
gulp.task(
  'wxs-watch',
  require('./tasks/copy').watch({
    config, 
    src: `./${configPath.src}/**/*.wxs`,
    find: configPath.src,
    replacement: configPath.dist
  })
)
gulp.task('router-watch', require('./tasks/router').watch(config))

gulp.task(
  'watch',
  gulp.series(
    gulp.parallel(
      'ts-watch',
      'less-watch',
      `views-watch`,
      `json-watch`,
      'image-watch',
      'wxs-watch',
      'npm-watch',
      `router-watch`
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
    gulp.parallel(
      'npm',
      'image',
      'less',
      'typescript',
      'wxs',
      `views`,
      'router',
      'json'
    ),
    (cb) => {
      done('Compiled successfully!')
      cb()
    }
  )
)

gulp.task('minify-npm', 
  gulp.series(
    require('./tasks/npm').minifyJS(config), 
  )
)

gulp.task('dev', gulp.series('clean', 'compile', 'watch', 'clearCache'))

gulp.task('build', gulp.series('clean', 'compile', 'minify-npm'))

gulp.on('error', error)

exports.execute = function (tasks, cb) {
  gulp.series(tasks)(function (err) {
    if (err) {
      error(err)
      throw err
    }
    cb && cb()
  })
}
