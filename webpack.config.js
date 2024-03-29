const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs');

const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const pkg = require('./package.json');

const getViews = directory => {
  const viewFilesLocation = fs.readdirSync(path.resolve(__dirname, directory));
  return viewFilesLocation
    .filter(file => {
      return (file = file.includes('.html'));
    })
    .map(file => {
      return file.split('.')[0];
    });
};

const views = getViews(path.join(__dirname, 'src', 'views'));

const outputFolder = 'build';

const stats = {
  all: false,
  assets: true,
  cachedAssets: true,
  children: false,
  chunks: false,
  entrypoints: true,
  errorDetails: true,
  errors: true,
  hash: true,
  modules: false,
  performance: true,
  publicPath: true,
  timings: true,
  warnings: false,
  exclude: ['node_modules']
};

module.exports = (env, argv) => {
  const config = {
    mode: argv.mode,
    devtool: argv.mode === 'production' ? false : 'eval',
    entry: views.reduce((config, view) => {
      config[view] = `./src/scripts/${view}.js`;
      return config;
    }, {}),
    output: {
      libraryTarget: 'umd',
      filename:
        argv.mode === 'production'
          ? 'scripts/[name].bundle.[contenthash:8].js'
          : '[name].bundle.js',

      path: path.resolve(__dirname, outputFolder),
      clean: true
    },
    resolve: {
      extensions: ['.js']
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../'
              }
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                sourceMap: true
              }
            }
          ]
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 1024
            }
          },
          generator: {
            filename:
              argv.mode === 'production'
                ? 'fonts/[name].[contenthash:8].[ext]'
                : 'fonts/[name].[ext]'
          }
        },
        {
          test: /\.hbs$/,
          loader: 'handlebars-loader',
          options: {
            helperDirs: path.join(__dirname, 'src', 'scripts', 'helpers', 'handlebars')
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        AppName: JSON.stringify(pkg.name),
        AppVersion: JSON.stringify(pkg.version),
        RepositoryUrl: JSON.stringify(pkg.repository.url)
      }),
      new MiniCssExtractPlugin({
        filename:
          argv.mode === 'production'
            ? 'styles/[name].[contenthash:8].css'
            : 'styles/[name].css',
        chunkFilename: '[id].css'
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'src', 'assets', 'icons', 'app.png'),
            to: path.join('public', 'assets')
          },
          {
            from: path.join(__dirname, 'src', 'assets', 'img'),
            to: path.join('public', 'assets', 'img')
          },
          {
            from: path.join(__dirname, 'src', 'assets', 'report'),
            to: path.join('public', 'assets', 'report')
          }
        ]
      })
    ].concat(
      views.map(
        view =>
          new HtmlWebpackPlugin({
            template: `./src/views/${view}.html`,
            filename: argv.mode === 'production' ? `public/${view}.html` : `${view}.html`,
            chunks: [view],
            meta: {
              viewport: 'width=device-width, initial-scale=1'
            },
            publicPath: argv.mode === 'production' ? '../' : '',
            inject: 'body'
          })
      )
    ),
    performance: {
      hints: false
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          parallel: true,
          terserOptions: {
            ecma: 2022,
            compress: {
              warnings: true,
              drop_console: true
            },
            output: {
              comments: false
            }
          }
        }),
        new CssMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true }
              }
            ]
          }
        })
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        maxSize: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            reuseExistingChunk: true
          }
        }
      }
    },
    stats,
    experiments: {
      topLevelAwait: true
    },
    devServer: {
      port: 4000,
      hot: true,
      historyApiFallback: true,
      compress: false,
      static: {
        directory: outputFolder,
        watch: true
      },
      devMiddleware: {
        index: true,
        publicPath: outputFolder,
        serverSideRender: true,
        writeToDisk: filePath => {
          return /^(?!.*(hot)).*/.test(filePath);
        }
      },
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        exec('nw ./src');

        return middlewares;
      }
    }
  };

  return config;
};
