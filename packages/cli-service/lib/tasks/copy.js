const gulp = require('gulp')
const rm = require('rimraf')
const { error, done } = require('@microprogram/shared-utils')

function compress(config, src, target) {
  target = target || config.dist

  return gulp
    .src(src)
    .on('error', (err) => {
      error(`${err}`, 'gulp-task-copy')
    })
    .pipe(gulp.dest(target))
}

exports.build = function (config, src, target) {
  return function () {
    return compress(config, src, target)
  }
}

exports.watch = function (config, src, target) {
  return function (cb) {
    gulp
      .watch(src, {
        delay: 1000
      })
      .on('change', function (file) {
        return compress(config, file, target)
      })
      .on('add', function (file) {
        return compress(config, file, target)
      })
      .on('unlink', function (file) {
        const distFile = file.replace(config.src, config.dist)
        rm(distFile, { maxBusyTries: 5 }, function (err) {
          if (!err) {
            done(distFile, `deleted "${file}"`)
          }
        })
      })
    cb && cb()
  }
}
