import {ProvidePlugin, IgnorePlugin, NamedModulesPlugin, HotModuleReplacementPlugin} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';

const src = `${__dirname}/src`;
const publicDir = `${__dirname}/public`;

const cssLoaders = [
    {
        loader: 'style-loader',
        options: {
            sourceMap: false,
        }
    },
    {
        loader: 'css-loader',
        options: {
            modules: true,
            localIdentName: '[name]_[local]--[hash:base64:5]',
            sourceMap: false,
            root: publicDir,
            camelCase: true,
        }
    }
];

let lessLoader = {
    loader: 'less-loader',
    options: {
        sourceMap: false, // https://github.com/webpack-contrib/less-loader#sourcemaps
        strictMath: true,
        strictUnits: true,
    }
};

const babelLoader = {
    loader: 'babel-loader',
    options: {
        cacheDirectory: true,
        forceEnv: 'development'
    }
}

export default {
    context: `${__dirname}/src`,
    mode: 'development',
    entry: {
        app: [
            'react-hot-loader/patch',
            `${__dirname}/src/index.js`,
        ], 
        base: `${__dirname}/src/styles/base.less`
    },
    output: {
        path: publicDir,
        filename: '[name].bundle.js',
        chunkFilename: 'chunk.[id].js',
        publicPath: '/',
        pathinfo: true,
        crossOriginLoading: 'anonymous'
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
            }
            ,
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
        extensions: ['.js','.json','.less','.svg'],
    },
    devtool: 'cheap-module-source-map',
    plugins: [
        new ProvidePlugin({
            React: 'react',
        }),
        new NamedModulesPlugin,
        new HotModuleReplacementPlugin,
        new HtmlWebpackPlugin( {
            template: 'index.html',
            filename: 'index.html',
            minify: {
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeComments: true,
            },
            hash: true,
            inject: 'head', // <=
            // files: {
            //     css: [ '[name].css' ],
            //     js: [ '[name].js'],
            //     chunks: {
            //         head: {
            //             'entry': '[name].css',
            //             'css': '[name].css'
            //         },
            //         main: {
            //             'entry': '[name].js',
            //             'css': []
            //         },
            //     }
            // }
        }),
        new ScriptExtHtmlWebpackPlugin({
            defer: 'app',
            sync: 'base',
        })
    ],
    devServer: {
        host: '0.0.0.0',
        disableHostCheck: true,
        hot: true,
        inline: true,
        port: 8080,
        contentBase: publicDir,
        historyApiFallback: true,
        stats: 'errors-only',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        watchOptions: {
            aggregateTimeout: 250,
            poll: 50
        },
    },
};