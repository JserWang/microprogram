const gulp = require('gulp')
const rm = require('rimraf')
const ts = require('gulp-typescript')
const argv = require('minimist')(process.argv.slice(2))

const dotenv = require('@microprogram/plugin-dotenv')
const { error, done } = require('@microprogram/shared-utils')
const tsProject = ts.createProject('./tsconfig.json')

function compress(config, src) {
  return gulp
    .src(src)
    .pipe(dotenv(argv.mode))
    .pipe(tsProject())
    .on('error', (err) => {
      error(`${err}`, `gulp-task-ts`)
    })
    .pipe(gulp.dest(config.dist))
}

exports.build = function (config) {
  return function () {
    return compress(config, `./${config.src}/**/*.ts`)
  }
}

exports.watch = function (config) {
  return function (cb) {
    gulp
      .watch(`./${config.src}/**/*.ts`, {
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
            done(distFile, `deleted ts`)
          }
        })
      })
    cb && cb()
  }
}
