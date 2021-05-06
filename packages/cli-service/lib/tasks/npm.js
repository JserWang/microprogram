const gulp = require('gulp')
const uglify = require('gulp-uglify')

exports.minifyJS = function (config) {
  const { path: configPath } = config

  return function() {
    return gulp
      .src(`./${configPath.dist}/${configPath.npm}/**/*.js`)
      .pipe(uglify())
      .pipe(gulp.dest(`${configPath.dist}/${configPath.npm}`))
  }
}
