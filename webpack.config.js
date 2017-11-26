const path = require('path');

module.exports = {
  entry: {
    'bstinsert': './app/src/bstinsert.js',
    'bstsearch': './app/src/bstsearch.js',
    'rbinsert': './app/src/rbinsert.js',
    'rbcolor': './app/src/rbcolor.js'
  },
  output: {
    path: __dirname + '/app',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
}
