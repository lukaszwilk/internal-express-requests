const exec = require('child_process').exec;
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  target: 'node',
  externals: [nodeExternals()],
  entry: './src/index.js',
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js',
  },
  module:{
    rules:[{
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
    }]
  },
};
