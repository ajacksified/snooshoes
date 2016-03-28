require('babel-register')({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.jsx))$/,
  extensions: ['.js', '.es6.js', '.jsx' ],
  sourceMap: true,
  presets: [
    'es2015',
  ],
  plugins: [
    'transform-object-rest-spread',
    'transform-async-to-generator',
    'transform-class-properties',
  ],
});

require('babel-polyfill');

require('./server.es6.js');
