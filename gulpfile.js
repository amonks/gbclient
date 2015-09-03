// gulpfile.js

var gulp = require('gulp')

var jade = require('gulp-jade')
var del = require('del')
var plumber = require('gulp-plumber')
var sass = require('gulp-sass')
var browserify = require('gulp-browserify')

gulp.task('prepare', function (callback) {
  del([
    './dist/'
  ])
})

gulp.task('js', function () {
  gulp.src('./src/js/main.js')
    .pipe(plumber())
    .pipe(browserify({
      insertGlobals: true,
      transform: ['babelify', 'hbsfy'],
      debug: true
    }))
    .pipe(gulp.dest('dist/'))
})

gulp.task('pub', function () {
  gulp.src('./pub/**/*.*')
    .pipe(gulp.dest('dist/'))
})

gulp.task('jade', function () {
  var locals = {}
  gulp.src('./src/jade/**/*.jade')
    .pipe(plumber())
    .pipe(jade({ locals: locals }))
    .pipe(gulp.dest('dist/'))
})

gulp.task('scss', function () {
  gulp.src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/'))
})

gulp.task('watch', ['build'], function () {
  gulp.watch('src/js/*.js', ['js'])
  gulp.watch('src/hbs/*.hbs', ['js'])
  gulp.watch('src/jade/*.jade', ['jade'])
  gulp.watch('src/scss/*.scss', ['scss'])
  gulp.watch('pub/**/*.*', ['pub'])
})

gulp.task('build', ['jade', 'pub', 'js', 'scss'])

gulp.task('default', ['build'])
