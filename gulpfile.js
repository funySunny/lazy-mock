require('babel-register')
const gulp = require('gulp')
const eslint = require('gulp-eslint')
const nodemon = require('gulp-nodemon')
const rename = require('gulp-rename')
const friendlyFormatter = require('eslint-friendly-formatter')
const nunjucksRender = require('gulp-nunjucks-render')
const codeGenerate = require('./templates/generate')

var jsScript = 'node'
if (process.env.npm_config_argv !== undefined && process.env.npm_config_argv.indexOf('debug') > 0) {
  jsScript = 'node debug'
}
function lintOne(aims) {
  console.log('ESlint:' + aims)
  console.time('Finished eslint')
  return gulp.src(aims)
    .pipe(eslint({ configFile: './.eslintrc.js' }))
    .pipe(eslint.format(friendlyFormatter))
    .pipe(eslint.results(results => {
      // Called once for all ESLint results.
      console.log(`- Total Results: ${results.length}`)
      console.log(`- Total Warnings: ${results.warningCount}`)
      console.log(`- Total Errors: ${results.errorCount}`)
      console.timeEnd('Finished eslint')
    }))
}

gulp.task('ESlint', () => {
  return gulp.src(['src/**/*.js', '!node_modules/**'])
    .pipe(eslint({ configFile: './.eslintrc.js' }))
    .pipe(eslint.format(friendlyFormatter))
    // .pipe(eslint.failAfterError())
    .pipe(eslint.results(results => {
      // Called once for all ESLint results.
      console.log(`- Total Results: ${results.length}`)
      console.log(`- Total Warnings: ${results.warningCount}`)
      console.log(`- Total Errors: ${results.errorCount}`)
    }))
})

gulp.task('ESlint_nodemon', ['ESlint'], function () {
  var stream = nodemon({
    script: 'build/dev-server.js',
    execMap: {
      js: jsScript
    },
    tasks: function (changedFiles) {
      lintOne(changedFiles)
      return []
    },
    verbose: true,
    ignore: ['build/*.js', 'dist/*.js', 'nodemon.json', '.git', 'node_modules/**/node_modules', 'gulpfile.js'],
    env: {
      NODE_ENV: 'development'
    },
    ext: 'js json'
  })

  return stream
    .on('restart', function () {
      // console.log('Application has restarted!')
    })
    .on('crash', function () {
      console.error('Application has crashed!\n')
      // stream.emit('restart', 20)  // restart the server in 20 seconds
    })
})

gulp.task('nodemon', function () {
  return nodemon({
    script: 'build/dev-server.js',
    execMap: {
      js: jsScript
    },
    verbose: true,
    ignore: ['build/*.js', 'dist/*.js', 'nodemon.json', '.git', 'node_modules/**/node_modules', 'gulpfile.js', 'src/db', 'codeGenerate'],
    env: {
      NODE_ENV: 'development'
    },
    ext: 'js json'
  })
})

gulp.task('default', ['ESlint', 'ESlint_nodemon'], function () {
  // console.log('ESlin检查完成')
})

const ServerFullPath = require('./package.json').ServerFullPath;
const FrontendFullPath = require('./package.json').FrontendFullPath;
const nunjucksRenderConfig = {
  path: 'templates/server',
  envOptions: {
    tags: {
      blockStart: '<%',
      blockEnd: '%>',
      variableStart: '<$',
      variableEnd: '$>',
      commentStart: '<#',
      commentEnd: '#>'
    },
  },
  ext: '.js',
  ServerFullPath,
  FrontendFullPath
}
gulp.task('code', function () {
  require('events').EventEmitter.defaultMaxListeners = 0
  return codeGenerate(gulp, nunjucksRender, rename, nunjucksRenderConfig)
});
