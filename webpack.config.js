const path = require('path');
const webpack = require('webpack');
const EslintWebpackPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: {
    app: ['core-js/stable', 'regenerator-runtime/runtime', './examples/Router/index.js'],
  },
  stats: 'verbose',
  context: __dirname,
  output: {
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    allowedHosts: 'all',
    host: 'localhost',
    hot: true,
    port: 5050,
    static: {
      directory: path.join(__dirname, '/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new EslintWebpackPlugin({
      extensions: ['js', 'jsx'],
      exclude: ['node_modules'],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
};
