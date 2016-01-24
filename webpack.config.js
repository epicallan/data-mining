/* eslint-disable */
var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
    child: ['babel-core/polyfill', './src/child.js'],
    tools: ['babel-core/polyfill', './src/tools/index.js'],
  },
  target: 'node',
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
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
  }
};
