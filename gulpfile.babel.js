const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const browserSync = require('browser-sync');
const named = require('vinyl-named');
const webpack = require('webpack-stream');
const {
    data,
} = require('json-file').read('./package.json');

function getMainHeader() {
    return `/*!
 * Name    : ${data.title}
 * Version : ${data.version}
 * Author  : ${data.author}
 * GitHub  : ${data.homepage}
 */
`;
}

/**
 * Error Handler for gulp-plumber
 */
function errorHandler(err) {
    // eslint-disable-next-line no-console
    console.error(err);
    this.emit('end');
}

/**
 * Clean Task
 */
gulp.task('clean', () => del(['dist']));

/**
 * JS Task
 */
gulp.task('js', () => (
    gulp.src(['src/*.js', '!src/*.esm.js'])
        .pipe($.plumber({ errorHandler }))
        .pipe(named())
        .pipe(webpack({
            mode: 'none',
            target: ['web', 'es5'],
            module: {
                rules: [{
                    test: /\.js$/,
                    loader: 'babel-loader',
                }],
            },
        }))
        .pipe($.header(getMainHeader()))
        .pipe(gulp.dest('dist'))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.uglify({
            output: {
                comments: /^!/,
            },
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream())
));

/**
 * CSS Task
 */
gulp.task('css', () => (
    gulp.src('src/*.css')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream())
));


/**
 * BrowserSync Task
 */
gulp.task('browser_sync', () => {
    browserSync.init({
        server: {
            baseDir: ['demo', './'],
        },
    });
});

/**
 * Build (default) Task
 */
gulp.task('build', (cb) => {
    gulp.series('clean', 'js', 'css')(cb);
});

gulp.task('default', (cb) => {
    gulp.series('build')(cb);
});

/**
 * Watch Task
 */
gulp.task('dev', gulp.parallel('browser_sync', gulp.series('build', () => {
    gulp.watch('src/*.js', gulp.series('js'));
    gulp.watch('src/*.css', gulp.series('css'));
})));
