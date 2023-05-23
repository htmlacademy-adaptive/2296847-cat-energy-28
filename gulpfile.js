import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import browser from 'browser-sync';
import del from 'del';
import { stacksvg } from "gulp-stacksvg";
import squoosh from 'gulp-libsquoosh';
import htmlmin from 'gulp-htmlmin';
import svgo from 'gulp-svgmin';
import terser from 'gulp-terser';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin( { collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
}

// Scripts

const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
}


// Images

const optimizeImages = () => {
  return gulp.src([
    'source/img/*.{png,jpg}',
    'source/img/products/*.{png,jpg}'
  ])
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
  }

  const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(gulp.dest('build/img'))
  }

// WebP

const createWebp = () => {
  return gulp.src([
    'source/img/*.{png,jpg}',
    'source/img/products/*.{png,jpg}'
  ])
  .pipe(squoosh({
  webp: {}
  }))
  .pipe(gulp.dest('build/img'))
  }

// SVG

const svgOptimize = () => {
  return gulp.src('source/img/**/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('build/img'))
}

const svgCopy = () => {
  return gulp.src('source/img/*.svg')
    .pipe(gulp.dest('build/img'))
}

const stack = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(stacksvg({ output: 'stack' }))
    .pipe(gulp.dest('build/img'))
}

// Copy

const copy = (done) => {
  gulp.src([
  'source/fonts/**/*.{woff2,woff}',
  'source/*.ico',
  'source/img/favicons/*.*',
  'source/manifest.webmanifest'
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
  }

// Clean

const clean = () => {
  return del ('build');
  };

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
  }

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles, reload));
  gulp.watch('source/js/script.js', gulp.series(scripts, reload))
  gulp.watch('source/*.html', gulp.series(html, reload));
}

//Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  svgOptimize,
  svgCopy,
  gulp.parallel(
  styles,
  html,
  scripts,
  stack,
  createWebp
  ),
  );

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  svgCopy,
  gulp.parallel(
  styles,
  html,
  scripts,
  stack,
  createWebp
  ),
  gulp.series(
  server,
  watcher
  ));
