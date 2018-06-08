const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const browserSync = require('browser-sync');
const named = require('vinyl-named');
const webpack = require('webpack-stream');
const data = require('json-file').read('./package.json').data;

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
gulp.task('js', () => {
    return gulp.src(['src/*.js', '!src/*.esm.js'])
        .pipe($.plumber({ errorHandler }))
        .pipe(named())
        .pipe(webpack({
            module: {
                loaders: [
                    {
                        test: /\.js$/,
                        use: [{
                            loader: 'babel-loader',
                        }],
                    },
                ],
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
        .pipe(browserSync.stream());
});

/**
 * CSS Task
 */
gulp.task('css', () => {
    return gulp.src('src/*.css')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});


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
 * Watch Task
 */
gulp.task('dev', () => {
    $.sequence('browser_sync', 'build', () => {
        gulp.watch('src/*.js', ['js']);
        gulp.watch('src/*.css', ['css']);
    });
});

/**
 * Build (default) Task
 */
gulp.task('build', (cb) => {
    $.sequence('clean', ['js', 'css'], cb);
});

gulp.task('default', ['build']);
