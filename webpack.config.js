const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

// Webpack plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Read the website configuration
const siteConfig = require('./site.config.js');

// Read the TypeScript configuration and use it
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

// Resolve modules, source, build and static paths
const sourceDirPath = path.resolve(__dirname, siteConfig.sourceDir);
const scriptPaths = _.union(..._.map(siteConfig.pages, page => page.scripts));
const buildDirPath = path.resolve(__dirname, tsconfig.compilerOptions.outDir);
const modulesDirPath = path.resolve(__dirname, 'node_modules');

/**
 * Creates the Webpack 2 configuration according to the
 * defined environment. The options are documented at
 * https://webpack.js.org/configuration/
 *
 * The 'env' parameter contains all the --env command line parameters passed to webpack:
 * https://webpack.js.org/configuration/configuration-types/#exporting-a-function-to-use-env
 *
 * The following --env parameters are supported:
 *
 * --env.devServer : Include the dev server host to the public URLs.
 * --env.debug : Disable compression and make the bundle easier to debug.
 */
module.exports = (env) => {
    // Read configuration from environment variables
    const devServerHost = env.host || '0.0.0.0';
    const devServerPort = env.port || 1111;
    const devServerBaseUrl = `http://${devServerHost}:${devServerPort}/`;
    const debug = env.debug;
    const devServer = env.devServer;
    // Generate the plugins
    const plugins = [
        // Extract stylesheets to separate files in production
        new ExtractTextPlugin({
            disable: devServer,
            filename: debug ? '[name].css' : '[name].[hash].css',
        }),
        // Create HTML plugins for each webpage
        ...siteConfig.pages.map(
            ({file, title, scripts}) => new HtmlWebpackPlugin({
                title: title,
                filename: path.format(_.assign(_.pick(path.parse(file), 'dir', 'name'), {ext: '.html'})),
                template: path.resolve(sourceDirPath, file),
                chunks: scripts.map(name => path.basename(name).replace(/\..*?$/, '')),
                // Insert tags for stylesheets and scripts
                inject: true,
                // No cache-busting needed, because hash is included in file names
                hash: false,
            })
        ),
        // This will strip out development features from React when building for production
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(debug ? 'development' : 'production'),
            },
        }),
    ];
    // If building for the production, minimize the JavaScript
    if (!debug) {
        plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                },
            })
        );
    }
    return {
        // The main entry points for source files.
        entry: _.fromPairs(
            scriptPaths.map(entry => [
                path.basename(entry).replace(/\..*?$/, ''),
                [path.resolve(sourceDirPath, entry)]
            ])
        ),

        output: {
            // Output files are place to this folder
            path: buildDirPath,
            // The file name template for the entry chunks
            filename: debug ? '[name].js' : '[name].[chunkhash].js',
            // The URL to the output directory resolved relative to the HTML page
            publicPath: devServer ? devServerBaseUrl : '/',
            // The name of the exported library, e.g. the global variable name
            library: 'app',
            // How the library is exported? E.g. 'var', 'this'
            libraryTarget: 'var',
        },

        module: {
            rules: [
                // Pre-process sourcemaps for scripts
                {
                    test: /\.(jsx?|tsx?)$/,
                    loader: 'source-map-loader',
                    enforce: 'pre',
                },
                // Lint TypeScript files using tslint
                {
                    test: /\.tsx?$/,
                    include: sourceDirPath,
                    loader: 'tslint-loader',
                    enforce: 'pre',
                    options: {
                        fix: true, // Auto-fix if possible
                    },
                },
                // Lint JavaScript files using eslint
                {
                    test: /\.jsx?$/,
                    include: sourceDirPath,
                    loader: 'eslint-loader',
                    enforce: 'pre',
                    options: {
                        cache: true,
                        failOnError: true, // Fail the build if there are linting errors
                        failOnWarning: false, // Do not fail the build on linting warnings
                        fix: true, // Auto-fix if possible
                    },
                },
                // Compile TypeScript files ('.ts' or '.tsx')
                {
                    test: /\.tsx?$/,
                    loader: 'awesome-typescript-loader',
                },
                // Extract CSS stylesheets from the main bundle
                {
                    test: /\.(css|scss)($|\?)/,
                    loader: ExtractTextPlugin.extract({
                        use: [{
                            loader: 'css-loader',
                            options: {
                                // For production, compress the CSS
                                minimize: !debug,
                                sourceMap: debug,
                                url: true,
                                import: true,
                            },
                        }],
                        fallback: 'style-loader',
                    }),
                },
                // Compile SASS files ('.scss')
                {
                    test: /\.scss($|\?)/,
                    loader: 'fast-sass-loader',
                },
                // Convert any Pug (previously 'Jade') templates to HTML
                {
                    test: /\.pug$/,
                    loader: 'pug-loader',
                    options: {
                        pretty: debug,
                    },
                },
                // Ensure that any images references in HTML files are included
                {
                    test: /\.(md|markdown|html?|tmpl)$/,
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'link:href'],
                    },
                },
                // Convert any Markdown files to HTML, and require any referred images/stylesheet
                {
                    test: /\.(md|markdown)$/,
                    loader: 'markdown-loader',
                },
                // Optimize image files and bundle them as files or data URIs
                {
                    test: /\.(gif|png|jpe?g|svg)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            // Max bytes to be converted to inline data URI
                            limit: 100,
                            // If larger, then convert to a file instead
                            name: 'images/[name].[hash].[ext]',
                        },
                    }, {
                        loader: 'image-webpack-loader',
                        options: {
                            progressive: true,
                            optipng: {
                                optimizationLevel: debug ? 0 : 7,
                            },
                        },
                    }],
                },
                // Include font files either as data URIs or separate files
                {
                    test: /\.(eot|ttf|otf|woff2?|svg)($|\?|#)/,
                    loader: 'url-loader',
                    options: {
                        // Max bytes to be converted to inline data URI
                        limit: 100,
                        // If larger, then convert to a file instead
                        name: 'fonts/[name].[hash].[ext]',
                    }
                }
            ],
        },

        resolve: {
            // Look import modules from these directories
            modules: [
                sourceDirPath,
                modulesDirPath,
            ],
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ['.ts', '.tsx', '.js'],
        },

        // When developing, enable sourcemaps for debugging webpack's output.
        devtool: debug ? 'cheap-eval-source-map' : 'source-map',

        // Configuration for webpack-dev-server
        devServer: {
            stats: {
                colors: true,
            },
            watchOptions: {
                poll: 1000,
            },
            host: process.env.HOST || '0.0.0.0',
            port: process.env.PORT || 1111,
        },

        // Plugins
        plugins: plugins,
    };
};
