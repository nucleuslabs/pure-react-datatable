import {ProvidePlugin, IgnorePlugin, NamedModulesPlugin, HotModuleReplacementPlugin} from 'webpack';

const src = `${__dirname}/src`;
const publicDir = `${__dirname}/public`;

const cssLoaders = [
    {
        loader: 'style-loader',
    },
    {
        loader: 'css-loader',
        options: {
            modules: true,
            localIdentName: '[name]_[local]--[hash:base64:5]',
            sourceMap: true,
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
        filename: '[name].js',
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
        extensions: ['.jsx', '.js'],
    },
    devtool: 'cheap-module-source-map',
    plugins: [
        new ProvidePlugin({
            React: 'react',
        }),
        new NamedModulesPlugin,
        new HotModuleReplacementPlugin,
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