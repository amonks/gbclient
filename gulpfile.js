// gulpfile.js

var gulp = require('gulp')

var jade = require('gulp-jade')
var del = require('del')
var plumber = require('gulp-plumber')
var sass = require('gulp-sass')
var babel = require('gulp-babel')
var concat = require('gulp-concat')
var handlebars = require('gulp-handlebars')
var wrap = require('gulp-wrap')
var declare = require('gulp-declare')

gulp.task('prepare', function () {
  del.sync([
    './dist/'
  ])
})

gulp.task('js', function () {
  gulp.src('./src/js/main.js')
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest('dist/'))
  gulp.src('./src/js/tweeter.js')
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest('dist/'))
})

gulp.task('hbs', function () {
  gulp.src('src/hbs/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'Gifbooth.templates',
      noRedeclare: true // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('dist/'))
})

gulp.task('pub', function () {
  gulp.src('./pub/**/*.*')
    .pipe(gulp.dest('dist/'))
})

gulp.task('jade', function () {
  var locals = {
    'PROXY_URL': 'http://gifbooth-proxy.herokuapp.com',
    'tweet_text': 'Another cool gif from the Gif Booth'
  }
  gulp.src('./src/jade/index.jade')
    .pipe(plumber())
    .pipe(jade({ locals: locals }))
    .pipe(concat('index.html'))
    .pipe(gulp.dest('dist/'))
})

gulp.task('jade-dev', function () {
  var locals = {
    'PROXY_URL': 'http://amonks.ngrok.io',
    'tweet_text': 'Another cool gif from the Gif Booth'
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
  gulp.watch('src/hbs/*.hbs', ['hbs'])
  gulp.watch('src/jade/*.jade', ['jade', 'jade-dev'])
  gulp.watch('src/scss/*.scss', ['scss'])
  gulp.watch('pub/**/*.*', ['pub'])
})

gulp.task('build', ['jade', 'jade-dev', 'pub', 'js', 'hbs', 'scss'])

gulp.task('default', ['build'])
