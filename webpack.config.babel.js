import {ProvidePlugin, HotModuleReplacementPlugin} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
import path from 'path';

export default (env, argv) => {
    const src = path.resolve(`${__dirname}/src`);
    const dist = `${__dirname}/dist`;

    const devMode = argv.mode === 'development';

    const babelLoader = {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
            envName: devMode ? 'development' : "production"
        }
    };

    const cssLoaders = [
        {
            loader: 'style-loader'
        },
        {
            loader: 'css-loader',
            options: {
                localsConvention: 'camelCase',
                modules: {
                    mode: 'local',
                    localIdentName: '[name]_[local]--[hash:base64:5]'
                }
            }
        }
    ];

    const lessLoader = {
        loader: 'less-loader',
        options: {
            strictMath: true,
            strictUnits: true,
        }
    };

    let config = {
        entry: ["@babel/polyfill", `${src}/components/DataTable.js`],
        output: {
            library: "PureReactDatatable",
            libraryTarget: "umd",
            filename: "index.js",
            path: dist,
            globalObject: "this"
        },
        resolveLoader: {
            modules: ['node_modules', `${__dirname}/webpack/loaders`]
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    use: babelLoader,
                    include: src,
                },
                {
                    test: /\.(jpe?g|png|gif)($|\?)/i,
                    include: src,
                    loader: 'sizeof-loader',
                    options: {
                        limit: 1024 * 2,
                    }
                },
                {
                    test: /\.svg($|\?)/i,
                    use: [babelLoader, 'svg-loader'],
                },
                {
                    test: /\.css$/,
                    use: cssLoaders
                },
                {
                    test: /\.s[ca]ss$/,
                    use: [...cssLoaders, 'sass-loader']
                },
                {
                    test: /\.less$/,
                    use: [...cssLoaders, lessLoader]
                }
            ]
        },
        target: 'web',
        resolve: {
            modules: ['node_modules'],
            // https://webpack.js.org/configuration/resolve/#resolve-extensions
            extensions: ['.js', '.json', '.less', '.svg'],
        },
        devtool: 'cheap-module-source-map',
        plugins: [],
        optimization: {
            namedModules: true,
            // splitChunks: { // CommonsChunkPlugin()
            //     name: 'vendor',
            //     minChunks: 2
            // },
        }
    };
    if(devMode) {
        config.context  = src;
        config.devtool = 'source-map';
        config.entry = {
            app: [
                "@babel/polyfill",
                'react-hot-loader/patch',
                `${src}/index.js`,
            ],
            base: `${src}/styles/base.less`
        };
        config.plugins.push(
            new ProvidePlugin({
                React: 'react',
            }),
            new HotModuleReplacementPlugin,
            new HtmlWebpackPlugin({
                template: `index.html`,
                filename: `index.html`,
                minify: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeComments: true,
                },
                hash: true,
                inject: 'body',
            }),
            new ScriptExtHtmlWebpackPlugin({
                defer: 'app',
                sync: 'base',
            })
        );
        config.devServer = {
            host: '0.0.0.0',
            disableHostCheck: true,
            hot: true,
            inline: true,
            port: 8080,
            contentBase: src,
            historyApiFallback: true,
            stats: 'errors-only',
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            // watchOptions: {
            //     aggregateTimeout: 250,
            //     poll: 50
            // },
        }
    }

    return config;
};
