const path = require('path');

module.exports = {
  entry: './src/index.ts',  // The entry point of your project
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',          // The output file
    path: path.resolve(__dirname, 'dist'),
  },
};
