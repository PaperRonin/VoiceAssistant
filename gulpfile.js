const gulp = require('gulp')
const ts = require("gulp-typescript")
const shell = require('gulp-shell')

const paths = {
    tsConfig: {
        src: './tsconfig.json',
    },
    srcFiles: 'src/**/*.ts',
    config: {
        src: 'src/config.json',
        dest: 'dist/'
    }
};

const tsProject = ts.createProject(paths.tsConfig.src)

function copySettings() {
    return gulp.src(paths.config.src)
        .pipe(gulp.dest(paths.config.dest))
}

function build() {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest(paths.config.dest))
}

function watch() {
    gulp.watch(paths.srcFiles, build)
}

exports.default = gulp.series(build, copySettings)
exports.dev = gulp.series(build, copySettings, shell.task(['start node ./dist/index.js']), watch)