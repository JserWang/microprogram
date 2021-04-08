const gulp = require('gulp')
const rm = require('rimraf')
const less = require('gulp-less')
const px2rpx = require('gulp-px2rpx')
const rename = require('gulp-rename')
const { error, done, PLATFORM_EXT } = require('@microprogram/shared-utils')

const getExt = (platform) => PLATFORM_EXT[platform].cssExt

function compress(config, src) {
  return gulp
    .src(src)
    .pipe(less({ allowEmpty: true }))
    .on('error', (err) => {
      error(`${err}`, 'gulp-task-less')
    })
    .pipe(px2rpx())
    .pipe(rename({ extname: `.${getExt(config.platform)}` }))
    .pipe(gulp.dest(config.dist))
}

exports.build = function (config) {
  return function () {
    return compress(config, `./${config.src}/**/*.less`)
  }
}

exports.watch = function (config) {
  return function (cb) {
    gulp
      .watch(`./${config.src}/**/*.less`, { delay: 1000 })
      .on('change', function (file) {
        return compress(config, file)
      })
      .on('add', function (file) {
        return compress(config, file)
      })
      .on('unlink', function (file) {
        const distFile = file
          .replace(config.src, config.dist)
          .replace(/\.\w*$/, '.wxss')

        rm(distFile, { maxBusyTries: 5 }, function (err) {
          if (!err) {
            done(distFile, `deleted ${getExt(config.platform)}`)
          }
        })
      })
    cb && cb()
  }
}
