/* eslint-disable */
var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: ['babel-polyfill', './src/main.js'],
  target: 'node',
  output: {
    path: __dirname + "/dist",
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  externals: [/^[a-z\-0-9]+$/],
  module: {
    loaders: [{
      test: /\.js?$/,
      include: [
        path.resolve(__dirname, "src"),
      ],
      exclude: /(node_modules)/,
      loader: "babel-loader"
    }]
  },
  query: {
    plugins: ['transform-runtime']
  }
};
