const gulp = require('gulp')
const path = require('path')
const components = require('@microprogram/plugin-components')
const { error, PLATFORM_EXT } = require('@microprogram/shared-utils')
const unlink = require('../util/unlink')
const empty = require('../util/empty')
const htmlmin = require('gulp-htmlmin')
const inject = require('gulp-inject-string')
const through = require("through2");
const argv = require('minimist')(process.argv.slice(2))

const getExt = (platform) => PLATFORM_EXT[platform].viewExt

function getAdditionalData(config) {
  const viewExt = getExt(config.platform)
  if (config[viewExt] && config[viewExt].additionalData) {
    const data = typeof config[viewExt].additionalData === 'function' ? config[viewExt].additionalData() : config[viewExt].additionalData
    if (data) {
      return data
    }
  }
  return ''
}

function injectPageFile(config) {
  return through.obj(function (file, enc, cb) {
    if (file.relative.startsWith(config.path.page)) {
      const code = file.contents.toString()
      file.contents = new Buffer.from(`${code}\n${getAdditionalData(config)}`)
    }
    cb(null, file);
  });
}

function compress(config, src, target) {
  const { componentKey: targetKey, transformers } = config.plugins.components
  target = target || config.path.dist
  return gulp
    .src(src)
    .pipe(injectPageFile(config))
    .pipe(
      components({
        targetKey,
        transformers
      })
    )
    .pipe(
      argv.mode === 'production' ? 
        htmlmin({ 
          collapseWhitespace: true, 
          keepClosingSlash: true,
          removeComments: true,
          caseSensitive: true
        }) : empty()
    )
    .on('error', (err) => {
      error(`${err}`, `gulp-task-${getExt(config.platform)}`)
    })
    .pipe(gulp.dest(target))
}

exports.build = function (config) {
  return function () {
    return compress(
      config,
      `./${config.path.src}/**/*.${getExt(config.platform)}`
    )
  }
}

exports.watch = function (config) {
  const { path: configPath } = config
  return function (cb) {
    gulp
      .watch(`./${configPath.src}/**/*.${getExt(config.platform)}`, {
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
          toPath: configPath.dist,
          tag: getExt(config.platform)
        })
      })
    cb && cb()
  }
}
