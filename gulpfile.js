var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var del = require('del');
var runSequence = require('run-sequence');

// Set the banner content
var banner = ['/*!\n',
  ' * ExactMotion - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2018-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' */\n',
  ''
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor-bootstrap', function() {
  // Bootstrap
  return gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'));

});

gulp.task('vendor-fontawesome', function() {
  // Font Awesome
  return gulp.src([
      './node_modules/@fortawesome/fontawesome-free/**/*',
      '!./node_modules/@fortawesome/fontawesome-free/{less,less/*}',
      '!./node_modules/@fortawesome/fontawesome-free/{scss,scss/*}',
      '!./node_modules/@fortawesome/fontawesome-free/.*',
      '!./node_modules/@fortawesome/fontawesome-free/*.{txt,json,md}'
    ])
    .pipe(gulp.dest('./vendor/fontawesome'));

});

gulp.task('vendor-jquery', function() {
  // jQuery
  return gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));

});

gulp.task('vendor-jquery-easing', function() {
  // jQuery Easing
  return gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./vendor/jquery-easing'));

});

gulp.task('vendor-magnific-popup', function() {
  // Magnific Popup
  return gulp.src([
      './node_modules/magnific-popup/dist/*'
    ])
    .pipe(gulp.dest('./vendor/magnific-popup'));

});

gulp.task('vendor-scrollreveal', function() {
  // Scrollreveal
  return gulp.src([
      './node_modules/scrollreveal/dist/*.js'
    ])
    .pipe(gulp.dest('./vendor/scrollreveal'));

});

gulp.task('vendor', ['vendor-bootstrap', 'vendor-fontawesome',
                     'vendor-jquery', 'vendor-jquery-easing',
                     'vendor-magnific-popup', 'vendor-scrollreveal'], function(){});
// Compile SCSS
gulp.task('css:compile', function() {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./css'))
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function() {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js:minify', function() {
  return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', ['js:minify']);

// Default task (css,js,vendor)
gulp.task('default', ['css', 'js', 'vendor']);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

// Dev task
gulp.task('dev', ['vendor', 'css', 'js', 'browserSync'], function() {
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./*.html', browserSync.reload);
});

//Clean up all generated files
gulp.task('clear', function() {
    return del.sync(['css','js/*.min.js','vendor','build'])
})

//Clean up build dir
gulp.task('clean:production', function() {
    return del.sync('build');
});

gulp.task('move-js', ['js'], function() {
    return gulp.src('js/creative.min.js')
        .pipe(gulp.dest('build/js'))
});

gulp.task('move-css', ['css'], function() {
    return gulp.src('css/creative.min.css')
        .pipe(gulp.dest('build/css'))
});

gulp.task('move-vendor', ['vendor'], function() {
    return gulp.src('vendor/**/**/*.*')
        .pipe(gulp.dest('build/vendor'))
});

gulp.task('move-images', function() {
    return gulp.src('img/**/*.*')
        .pipe(gulp.dest('build/img'))
});

gulp.task('move-index', function() {
    return gulp.src('index.html')
        .pipe(gulp.dest('build/'))
});

//serve-prod but in sequence
gulp.task('build-prod', function (callback) {
    runSequence('clean:production',
         'move-js', 'move-css', 'move-vendor',
         'move-images', 'move-index', callback
    );
});
