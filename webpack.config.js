const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const url = require('url');
const webpack = require('webpack');
const childProcess = require('child_process');

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
 * --env.baseUrl : The base URL for the static assets. Must end with '/'
 * --env.devServer : Include the dev server host to the public URLs.
 * --env.debug : Disable compression and make the bundle easier to debug.
 */
module.exports = (env) => {
    // Read configuration from environment variables
    const baseUrl = env.baseUrl || 'http://0.0.0.0:1111/';
    const baseUrlObj = new url.URL(baseUrl);
    const serverHostName = baseUrlObj.hostname;
    const serverPort = parseInt(baseUrlObj.port, 10);
    const debug = env.debug;
    const devServer = env.devServer;
    const iconFile = env.iconFile;
    const gitCommitHash = childProcess.execSync('git rev-parse HEAD').toString().trim();
    const gitVersion = childProcess.execSync('git describe --always').toString().trim();
    const gitBranch = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
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
        /**
         * Replace "global variables" from the scripts with the constant values.
         */
        new webpack.DefinePlugin({
            // This will strip out development features from React when building for production
            'process.env': {
                NODE_ENV: JSON.stringify(debug ? 'development' : 'production'),
            },
            // Allow using the GIT commit hash ID
            '__COMMIT_HASH__': JSON.stringify(gitCommitHash),
            // Allow using the GIT version
            '__VERSION__': JSON.stringify(gitVersion),
            // Allow using the GIT branch name
            '__BRANCH__': JSON.stringify(gitBranch),
        }),
    ];
    /**
     * If icon source file is provided, generate icons for the app.
     * For configuration, see https://github.com/jantimon/favicons-webpack-plugin
     */
    if (iconFile) {
        const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
        plugins.push(
            new FaviconsWebpackPlugin({
                // Your source logo
                logo: iconFile,
                // The prefix for all image files (might be a folder or a name)
                prefix: debug ? 'icons/' : 'icons/[hash]/',
                // Emit all stats of the generated icons
                emitStats: true,
                // Generate a cache file with control hashes and
                // don't rebuild the favicons until those hashes change
                persistentCache: true,
                // Inject the html into the html-webpack-plugin
                inject: true,
                /**
                 * Which icons should be generated.
                 * See: https://github.com/haydenbleasel/favicons#usage
                 * Platform Options:
                 * - offset - offset in percentage
                 * - shadow - drop shadow for Android icons, available online only
                 * - background:
                 *   * false - use default
                 *   * true - force use default, e.g. set background for Android icons
                 *   * color - set background for the specified icons
                 */
                icons: {
                    // Create Android homescreen icon. `boolean` or `{ offset, background, shadow }`
                    android: !debug,
                    // Create Apple touch icons. `boolean` or `{ offset, background }`
                    appleIcon: !debug,
                    // Create Apple startup images. `boolean` or `{ offset, background }`
                    appleStartup: !debug,
                    // Create Opera Coast icon with offset 25%. `boolean` or `{ offset, background }`
                    coast: !debug,
                    // Create regular favicons. `boolean`
                    favicons: true,
                    // Create Firefox OS icons. `boolean` or `{ offset, background }`
                    firefox: !debug,
                    // Create Windows 8 tile icons. `boolean` or `{ background }`
                    windows: !debug,
                    // Create Yandex browser icon. `boolean` or `{ background }`
                    yandex: !debug,
                }
            })
        );
    }
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
            publicPath: baseUrl,
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
            host: serverHostName,
            port: serverPort,
        },

        // Plugins
        plugins: plugins,
    };
};
