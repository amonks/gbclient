// gulpfile.js

var gulp = require('gulp')

var jade = require('gulp-jade')
var del = require('del')
var plumber = require('gulp-plumber')
var sass = require('gulp-sass')
var browserify = require('gulp-browserify')
var concat = require('gulp-concat')

gulp.task('prepare', function () {
  del.sync([
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
  var locals = {
    'PROXY_URL': 'http://gifbooth-proxy.herokuapp.com'
  }
  gulp.src('./src/jade/index.jade')
    .pipe(plumber())
    .pipe(jade({ locals: locals }))
    .pipe(concat('index.html'))
    .pipe(gulp.dest('dist/'))
})

gulp.task('jade-dev', function () {
  var locals = {
    'PROXY_URL': '//localhost:8000'
  }
  gulp.src('./src/jade/index.jade')
    .pipe(plumber())
    .pipe(jade({ locals: locals }))
    .pipe(concat('dev.html'))
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
  gulp.watch('src/jade/*.jade', ['jade', 'jade-dev'])
  gulp.watch('src/scss/*.scss', ['scss'])
  gulp.watch('pub/**/*.*', ['pub'])
})

gulp.task('build', ['jade', 'jade-dev', 'pub', 'js', 'scss'])

gulp.task('default', ['build'])
