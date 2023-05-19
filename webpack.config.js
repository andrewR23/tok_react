const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
    hash: true,
    title: 'Webpack Template App',
    header: 'Webpack Example Title',
    metaDesc: 'Webpack Example Description',
    template: './src/index.html',
    filename: './index.html',
    inject: 'body'
  })
  ],

  mode: 'development',  

  entry: {
      index: './src/index.js',
     // -- mod1:  './src/module_1.js', -- //
  },

  output: {
    filename: 'index.js',
    // -- filename: '[name].bundle.js', -- // 
    path: path.resolve(__dirname, 'dist'),
    clean: true,
   },

  // devServer: {
  //   static: './',
  //   compress: true,
  //   port: 8080,
  // },
  
 module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader'],
      },
      {
        test: /\.xml$/i,
        use: ['xml-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader"}
      },
      {
        test: /\.html$/,
        use:['html-loader'],

      }
     
    ],
  },
};