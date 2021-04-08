const gulp = require('gulp')
const components = require('@microprogram/plugin-components')
const rm = require('rimraf')
const { error, done, PLATFORM_EXT } = require('@microprogram/shared-utils')

const getExt = (platform) => PLATFORM_EXT[platform].viewExt

function compress(config, src) {
  return gulp
    .src(src)
    .pipe(
      components({
        targetKey: config.componentKey,
        transformers: config.transformers
      })
    )
    .on('error', (err) => {
      error(`${err}`, `gulp-task-${getExt(config.platform)}`)
    })
    .pipe(gulp.dest(config.dist))
}

exports.build = function (config) {
  return function () {
    return compress(config, `./${config.src}/**/*.${getExt(config.platform)}`)
  }
}

exports.watch = function (config) {
  return function (cb) {
    gulp
      .watch(`./${config.src}/**/*.${getExt(config.platform)}`, {
        delay: 1000
      })
      .on('change', function (file) {
        return compress(config, file)
      })
      .on('add', function (file) {
        return compress(config, file)
      })
      .on('unlink', function (file) {
        const distFile = file.replace(config.src, config.dist)
        rm(distFile, { maxBusyTries: 5 }, function (err) {
          if (!err) {
            done(distFile, `deleted ${getExt(config.platform)}`)
          }
        })
      })
    cb && cb()
  }
}
