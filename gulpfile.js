const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
 
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
