var gulp = require('gulp');
var config = require('./gulpconfig');
// Global
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var runsequence = require('run-sequence');
var browsersync = require('browser-sync');
var del = require('del');
// HTML
var uncss = require('gulp-uncss');
var htmlmin = require('gulp-htmlmin');
// CSS

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');

// POSTCSS
var postcss = require("gulp-postcss");
var stylelint = require('stylelint');
var reporter = require('postcss-reporter');
var synSCSS = require('postcss-scss');
// JS
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
// IMAGES
var imagemin = require('gulp-imagemin');

var reload = browsersync.reload;

gulp.task('html', function() {
  return gulp.src(config.src + '/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(config.dist));
});

gulp.task('styles', function() {
  return gulp.src(config.styles.path.input)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: config.styles.autoprefixer
    }))
    .pipe(cssnano({ zindex: false }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.styles.path.output));
});

gulp.task('lint:css', function() {
  return gulp.src(config.styles.path.input)
    .pipe(postcss([
      stylelint(config.styles.rules),
      reporter({
        clearMessages: true
      })
    ], {
      syntax: synSCSS
    }));
});

gulp.task('scripts', function() {
  return browserify(config.scripts.path.input, {
      // debug: true,
      paths: config.scripts.path.browserify
    })
    .transform('babelify')
    .bundle().on('error', function(err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(source('main.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(uglify(config.scripts.uglify))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.scripts.path.output));
});

gulp.task('lint:js', function() {
  return gulp.src(config.scripts.path.linter)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('images', function() {
  return gulp.src(config.images.path.input)
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      optimizationLevel: 4,
      multipass: true
    }))
    .pipe(gulp.dest(config.images.path.output));
});


gulp.task('clean', function() {
  return del(config.delete, {
    dot: true
  });
});

gulp.task('copy', function() {
  return gulp.src(config.copy, {
      dot: true
    })
    .pipe(gulp.dest(config.dist));
});

gulp.task('deploy:service-worker', function() {
  return gulp.src('./src/service-worker.js')
    .pipe(gulp.dest(config.dist));
});

gulp.task('default', ['copy', 'html', 'images', 'styles', 'scripts'], function() {
  browsersync(config.browsersync.default);
  gulp.watch([config.src + '/**/*.html'], ['html', reload]);
  gulp.watch([config.src + '/images/**/*'], ['images', reload]);
  gulp.watch([config.src + '/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch([config.src + '/scripts/**/*.js'], ['lint:js', 'scripts', reload]);
});

gulp.task('serve:proxy', ['copy', 'html', 'images', 'styles', 'scripts'], function(){
  browsersync(config.browsersync.proxy);
  gulp.watch([config.src + '/**/*.html'], ['html', reload]);
  gulp.watch([config.src + '/images/**/*'], ['images', reload]);
  gulp.watch([config.src + '/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch([config.src + '/scripts/**/*.js'], ['lint:js', 'scripts', reload]);
});
