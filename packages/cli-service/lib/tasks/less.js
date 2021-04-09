const gulp = require('gulp')
const path = require('path')
const less = require('gulp-less')
const px2rpx = require('gulp-px2rpx')
const rename = require('gulp-rename')
const { error, PLATFORM_EXT } = require('@microprogram/shared-utils')
const unlink = require('../util/unlink')

const getExt = (platform) => PLATFORM_EXT[platform].cssExt

function compress(config, src, target) {
  target = target || config.path.dist

  return gulp
    .src(src)
    .pipe(less({ allowEmpty: true }))
    .on('error', (err) => {
      error(`${err}`, 'gulp-task-less')
    })
    .pipe(px2rpx())
    .pipe(rename({ extname: `.${getExt(config.platform)}` }))
    .pipe(gulp.dest(target))
}

exports.build = function (config) {
  return function () {
    return compress(config, `./${config.path.src}/**/*.less`)
  }
}

exports.watch = function (config) {
  const { path: configPath, platform } = config
  const extname = getExt(platform)

  return function (cb) {
    gulp
      .watch(`./${configPath.src}/**/*.less`, { delay: 1000 })
      .on('change', function (file) {
        return compress(
          config,
          [`${path.dirname(file)}/*${path.extname(file)}`],
          path.dirname(
            file
              .replace(configPath.src, configPath.dist)
              .replace(/\.\w*$/, extname)
          )
        )
      })
      .on('add', function (file) {
        return compress(
          config,
          [`${path.dirname(file)}/*${path.extname(file)}`],
          path.dirname(
            file
              .replace(configPath.src, configPath.dist)
              .replace(/\.\w*$/, extname)
          )
        )
      })
      .on('unlink', function (file) {
        return unlink({
          file,
          fromPath: configPath.src,
          toPath: configPath.dist,
          tag: extname,
          extname: `.${extname}`
        })
      })
    cb && cb()
  }
}
