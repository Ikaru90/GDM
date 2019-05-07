const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');

gulp.task('copy:html', () => {
  return gulp.src('src/client/index.html')
    .pipe(gulp.dest('build/'));
});

gulp.task('copy:js', () => {
  return gulp.src('src/client/bundle.js')
    .pipe(gulp.dest('build/public/'));
});

gulp.task('server:build', () =>
  gulp.src('src/server/app.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
  .pipe(gulp.dest('build'))
);

gulp.task('server:start', (done) => nodemon({
    script: 'build/app.js',
    watch: 'src/server',
    tasks: ['server:build'],
    done: done
  })
);
