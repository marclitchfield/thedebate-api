var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  changed = require('gulp-changed'),
  del = require('del'),
  path = require('path'),
  config = require('./package.json');

var testUrl = 'http://localhost:9002';

var paths = {
  dist: {
    root: 'dist/',
    files: 'dist/**',
    server: 'dist/'
  },
  server: {
    root: 'server/',
    files: ['server/**/*.js']
  },
  test: {
    root: 'tests/',
    files: ['tests/**/*.js']
  }
};

//----------------------------------------------------------------------
// Tasks

gulp.task('clean', function(cb) {
  del(paths.dist.files, cb);
});

gulp.task('server', ['server node_modules'], function() {
  return gulp.src(paths.server.files)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest(paths.dist.server));
});

gulp.task('lint-tests', function() {
  return gulp.src(paths.test.files)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('server node_modules', function() {
  // copy node_modules listed in paths.server.modules to node_modules in paths.dist.server
  return gulp.src(Object.keys(config.dependencies).map(function(m) {
    return path.join('node_modules', m, '/**');
  }), { base: './' })
  .pipe(changed(paths.dist.server))
  .pipe(gulp.dest(paths.dist.server));
});

gulp.task('watch', function() {
  gulp.watch(paths.server.files, ['server']);
  gulp.watch(paths.test.files, ['lint-tests']);
});

gulp.task('default', function() {
  gulp.start('server');
});
