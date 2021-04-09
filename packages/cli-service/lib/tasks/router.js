const gulp = require('gulp')
const router = require('@microprogram/plugin-router')

function compress(config) {
  return gulp.src(config.router.path).pipe(router())
}

exports.build = function (config) {
  return function () {
    return compress(config)
  }
}

exports.watch = function (config) {
  return function (cb) {
    gulp
      .watch(config.router.path, {
        delay: 1000
      })
      .on('change', function () {
        return compress(config)
      })
      .on('add', function () {
        return compress(config)
      })
    cb && cb()
  }
}
