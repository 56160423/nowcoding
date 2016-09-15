var gulp = require('gulp'),
    elixir = require('laravel-elixir'),
    $ = elixir.Plugins,
    fs = require('fs');

require('elixir-typescript');
var webpack = require('webpack-stream');
/*
 |--------------------------------------------------------------------------
 | elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */
gulp.task('watch', ['scripts'], function() {
    return gulp.watch('resources/assets/typescript/*.ts', ['scripts']);
});

elixir.extend('webpack', function (src, output, options) {

    new elixir.Task('webpack', function () {
        this.log(src, output);

        return (
            gulp.src(src)
                .pipe(webpack({
                    output: {
                        filename: 'bundles.js'
                    }
                }))
                .on('error', function(e) {
                    new elixir.Notification('Webpack Compilation Failed!');

                    this.emit('end');
                })
                .pipe(gulp.dest(output))
                .pipe(new elixir.Notification('Webpack Compiled!'))
        );
    }).watch(src);
});

elixir.extend('copy_without_watcher', function(src, output) {
    var paths = new elixir.GulpPaths().src(src).output(output);

    new elixir.Task('copy_without_watcher', function() {
        this.log(paths.src, paths.output);

        return (
            gulp
                .src(paths.src.path)
                .pipe($.if(! paths.output.isDir, $.rename(paths.output.name)))
                .pipe(gulp.dest(paths.output.baseDir))
        );
    });
});

elixir(function(mix) {
    /* Copy node_modules dependencies */
    var data = fs.readFileSync('package.json');
    var dependencies = JSON.parse(data).dependencies;
    for (var key in dependencies) {
        if (dependencies.hasOwnProperty(key)) {
            mix.copy_without_watcher('node_modules/' + key + "/", 'public/node_modules/' + key + "/");
        }
    }

    /* Copy systemjs config */
    mix.copy('systemjs.conf.js', 'public/systemjs.conf.js');

    //
    mix.sass('app.scss');

    mix.typescript(
        'boot.ts',
        'public/js/boot.js'
    );

    mix.webpack('public/js/boot.js', 'public/js/');

});
