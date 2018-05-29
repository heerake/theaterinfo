/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const fs = require('fs');
const isProduction = process.env.NODE_ENV === 'production';
const template = require('lodash').template;
const tplImpl = template(fs.readFileSync(path.join(__dirname, 'src', 'template.ejs'), 'utf8'));
const { CheckerPlugin } = require('awesome-typescript-loader');
const pages = [];

const entries = fs.readdirSync(path.resolve(process.cwd(), 'src', 'entry'))
    .reduce((res, filename) => {
        if (/.+\.tsx?$/.test(filename)) {
            const name = filename.replace(/\.tsx?/, '');
            pages.push({
                name,
                pathname: path.join(__dirname, 'dist', name + '.html'),
            });
            return Object.assign({}, res, { [name]: `./src/entry/${name}` });
        }
        return res;
    }, {});

pages.forEach(function (cfg) {
    const code = tplImpl(cfg);
    fs.writeFile(cfg.pathname, code, function (err) {
        if (err) {
            console.error(err);
            return;
        }
    });
});

const plugins = [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CheckerPlugin(),
    new ExtractTextPlugin({
        filename: '[name].css',
        allChunks: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.EnvironmentPlugin({ 'NODE_ENV': process.env.NODE_ENV }),
    // uglifyJSPlugin
];

module.exports = {
    entry: entries,
    output: {
        filename: "[name].js",
        path: __dirname + '/dist'
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        modules: ["node_modules", "node_modules/lodash-es"],
        extensions: [".ts", ".tsx", ".js", ".json", ".jsx"],
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            transpileOnly: true,
                            configFileName: 'tsconfig.json'
                        }
                    },
                ],
                include: [
                    path.resolve(__dirname, 'src'),
                ]
            },
            {
                test: /\.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'less-loader']
                })
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.json$/,
                use: [{
                    loader: 'json-loader'
                }]
            }
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    stats: {
        assets: true
    },

    watch: true,

    devServer: {
        compress: true, // enable gzip compression
        historyApiFallback: false, // true for index.html upon 404, object for multiple paths
        hot: true,
        watchOptions: {
            ignored: /node_modules/,
            poll: 1000
        },
        contentBase: './',
        publicPath: '/dist',
        port: 8080,
        stats: {
            assets: true
        },
        allowedHosts: [
            'localhost',
        ]
    },

    plugins: plugins
};