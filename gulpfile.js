var gulp   = require('gulp')
, path   = require('path')
, merge  = require('event-stream').merge
, $      = require('gulp-load-plugins')()
, libs   = ['./libs/**/*', './src/*.js', './src/chrome/**/*']
, csses  = ['./src/css/**/*']

/**
 * Public tasks
 */
gulp.task('clean', function() {
    return pipe('./tmp', [$.clean()])
})

gulp.task('build', function(cb) {
    $.runSequence('clean', 'chrome', 'opera', 'safari', 'firefox', cb)
})

gulp.task('default', ['build'], function() {
    gulp.watch(['./src/**/*'], ['default'])
})

gulp.task('dist', ['build'], function(cb) {
    $.runSequence('firefox:xpi', 'chrome:zip', 'chrome:crx', 'opera:nex', cb)
})

/**
 * Private tasks
 */

// Chrome
gulp.task('chrome', function() {
    return merge(
        pipe(libs, './tmp/chrome/'),
        pipe(csses, './tmp/chrome/css')         
    )
})

gulp.task('chrome:zip', function() {
    return pipe('./tmp/chrome/**/*', [$.zip('chrome.zip')], './dist')
})

gulp.task('chrome:_crx', function(cb) {
    $.run('"/usr/bin/google-chrome"' + 
    ' --pack-extension=' + path.join(__dirname, './tmp/chrome') +
    ' --pack-extension-key=' + path.join(process.env.HOME, '.ssh/chrome.pem')
    ).exec(cb)
})

gulp.task('chrome:crx', ['chrome:_crx'], function() {
    return pipe('./tmp/chrome.crx', './dist')
})

// Opera

gulp.task('opera', ['chrome'], function() {
    return pipe('./tmp/chrome/**/*', './tmp/opera')
})

gulp.task('opera:nex', function() {
    return pipe('./dist/chrome.crx', [$.rename('opera.nex')], './dist')
})


gulp.task('safari', function() {
    return merge(
       pipe(libs.concat(['./src/safari/**/*']), './tmp/safari/troll-blocker.safariextension/')
    )
})



gulp.task('firefox',  function() {
    return merge(       
        pipe(['./libs/**/*', './src/*.js'], './tmp/firefox/data'),
        pipe(csses, './tmp/firefox/data/css'),
        pipe(['./src/firefox/firefox.js'], './tmp/firefox/lib'),
        pipe('./src/firefox/package.json', './tmp/firefox')
    )
})

gulp.task('firefox:xpi', function(cb) {
    $.run('cd ./tmp/firefox && jpm xpi--addon-dir .').exec(cb)
})

/**
 * Helpers
 */
function pipe(src, transforms, dest) {
    if (typeof transforms === 'string') {
        dest = transforms
        transforms = null
    }
    var stream = gulp.src(src)
    transforms && transforms.forEach(function(transform) {
        stream = stream.pipe(transform)
    })
    if (dest) stream = stream.pipe(gulp.dest(dest))
        return stream
}



