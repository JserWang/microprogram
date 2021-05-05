const gulp = require('gulp')
const router = require('@microprogram/plugin-router')

function compress(config) {
  return gulp
    .src(config.plugins.router.path)
    .pipe(router(`${config.path.src}/app.json`, config.platform))
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
