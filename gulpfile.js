const gulp = require('gulp');
const ts = require("gulp-typescript");
const clean = require('gulp-clean');


const paths = {
    tsConfig: {
        src: './tsconfig.json',
    },
    config: {
        src: 'src/config.json',
        dest: 'dist/'
    }
};

const tsProject = ts.createProject(paths.tsConfig.src);

gulp.task('clean', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('copy-settings', function () {
    return gulp.src(paths.config.src)
        .pipe(gulp.dest(paths.config.dest));
});

gulp.task('build', function () {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest("dist"));
});

gulp.task('default', gulp.series('build', 'copy-settings'));