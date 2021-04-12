const gulp = require('gulp')
const path = require('path')
const { error } = require('@microprogram/shared-utils')
const unlink = require('../util/unlink')

function compress(config, src, target) {
  target = target || config.path.dist
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

exports.watch = function (config, src) {
  const { path: configPath } = config
  return function (cb) {
    gulp
      .watch(src, {
        delay: 1000
      })
      .on('change', function (file) {
        return compress(
          config,
          [`${path.dirname(file)}/*${path.extname(file)}`],
          path.dirname(file.replace(configPath.src, configPath.dist))
        )
      })
      .on('add', function (file) {
        return compress(
          config,
          [`${path.dirname(file)}/*${path.extname(file)}`],
          path.dirname(file.replace(configPath.src, configPath.dist))
        )
      })
      .on('unlink', function (file) {
        return unlink({
          file,
          fromPath: configPath.src,
          toPath: configPath.dist
        })
      })
    cb && cb()
  }
}
