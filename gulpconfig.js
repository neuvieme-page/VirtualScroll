var config = {
  styles: {
    path: {
      input: [
        './src/styles/**/*.scss',
        './src/styles/**/*.css'
      ],
      output: './dist/styles'
    },
    autoprefixer: [
      'ie >= 10',
      'ie_mob >= 10',
      'ff >= 30',
      'chrome >= 34',
      'safari >= 7',
      'opera >= 23',
      'ios >= 7',
      'android >= 4.4',
      'bb >= 10'
    ],
    rules: {
      "rules": {
        "color-no-invalid-hex": true,
        "declaration-colon-space-after": "always",
        "max-empty-lines": 2,
        "indentation": [2]
      }
    }
  },
  scripts: {
    path: {
      input: [
        './src/scripts/main.js'
      ],
      output: './dist/scripts',
      linter: ['./src/scripts/**/*.js'],
      browserify: [
        './src/scripts',
        './src/scripts/libs',
        './src/scripts/modules',
        './bower_components'
      ]
    },
    uglify: {
      preserveComment: 'license',
      mangle: false
    }
  },
  images: {
    path: {
      input: [
        './src/images/**/*'
      ],
      output: './dist/images'
    }
  },
  src: './src',
  dist: './dist',
  copy: [
    'src/**/*',
    '!src/*.html',
    '!src/service-worker.js',
    '!src/scripts/**/*.js',
    '!src/styles/*.scss',
    '!src/images/*.{svg,jpg,jpeg,png}',
    'node_modules/apache-server-configs/dist/.htaccess'
  ],
  delete: ['dist/*', '!dist/.git'],
  browsersync: {
    default: {
      notify: false,
      logPrefix: 'BWS',
      server: ['dist'],
      port: 3000,
      open: false
    },
    proxy: {
      notify: false,
      logPrefix: 'BWS',
      proxy: 'http://localhost:80',
      port: 3000,
      open: false
    }
  }
};

module.exports = config;
