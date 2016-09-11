const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () => {
	return gulp.src(['app.js', 'src/**/*.js'])
		.pipe(babel({
			plugins: ['transform-async-to-generator']
		}))
		.pipe(gulp.dest('dist'));
});
