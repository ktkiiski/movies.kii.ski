const { argv } = require('yargs');
const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const del = require('del');
const _ = require('lodash');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const createWebpackConfig = require('./webpack.config.js');
const siteConfig = require('./site.config.js');
const path = require('path');
const { Broiler, src$ } = require('broiling');
const broiler = new Broiler({ region: siteConfig.region });

// Where the CloudFormation template is located
const cloudFormationTemplatePath = path.resolve(__dirname, 'cloudformation.yml');
// Static assets are cached for a year
const staticAssetsCacheDuration = 31556926;
// HTML pages are cached for an hour
const staticHtmlCacheDuration = 3600;
// Whether or not running in debug mode
const debug = !!argv.debug;

/**
 * Clean the build folder.
 */
gulp.task('clean', () => del(['dist/**/*']));

/**
 * Build the JavaScript and stylesheet assets by
 * using the Webpack 2.
 */
gulp.task('build', ['clean'], callback => {
    const stage = getStage();
    gutil.log('[build]', `Building the app stage '${stage}' for ${debug ? 'debugging' : 'release'}...`);
    const iconFile = siteConfig.iconFile;
    const stageConfig = siteConfig.stages[stage];
    const assetsDomain = stageConfig.assetsDomain;
    const baseUrl = `https://${assetsDomain}/`;
    const webpackConfig = createWebpackConfig({ baseUrl, debug, iconFile });
    webpack(webpackConfig).run((err, stats) => {
        if (err) {
            callback(err, stats);
        } else {
            gutil.log('[build]', stats.toString({
                colors: true,
            }));
            if (stats.hasErrors()) {
                callback(new Error(stats.toString('errors-only')), stats);
            } else {
                callback(null, stats);
            }
        }
    });
});

/**
 * Serves and auto-reloads with webpack-dev-server.
 */
// eslint-disable-next-line no-unused-vars
gulp.task('serve', callback => {
    const iconFile = siteConfig.iconFile;
    const webpackConfig = createWebpackConfig(({ debug, iconFile, devServer: true }));
    const serverConfig = webpackConfig.devServer;
    const host = serverConfig.host;
    const port = serverConfig.port;
    const baseUrl = `http://${host}:${port}/`;
    // Modify the configuration so that the inline livereloading is enabled.
    // See: https://webpack.github.io/docs/webpack-dev-server.html#inline-mode-with-node-js-api
    _.each(webpackConfig.entry, entries => entries.unshift(`webpack-dev-server/client?${baseUrl}`));
    new WebpackDevServer(webpack(webpackConfig), serverConfig).listen(port, host, err => {
        if (err) {
            throw new gutil.PluginError('serve', err);
        }
        gutil.log('[serve]', baseUrl);
    });
});

/**
 * Create or update the CloudFormation stack.
 */
gulp.task('cloudformation:deploy', [], () => {
    const stage = getStage();
    const appStageName = `${siteConfig.appName}-${stage}`;
    const parameters = getCloudFrontDeploymentParameters(stage, appStageName);
    const template = fs.readFileSync(cloudFormationTemplatePath, 'utf8');
    gutil.log('[cloudformation]', `Preparing deployment for the stage "${stage}"`);
    return broiler.deployStack$(appStageName, parameters, template).toPromise();
});

/**
 * Invalidate cached HTML items from the CloudFront distributions.
 */
gulp.task('cloudformation:invalidate', ['cloudformation:deploy'], () => {
    const stage = getStage();
    const appStageName = `${siteConfig.appName}-${stage}`;
    return broiler.getStackOutput$(appStageName)
        .map(output => output.SiteCloudFrontDistributionId)
        .do(distributionId => gutil.log(
            '[cloudformation]', `Invalidating cached items from the CloudFront distribution ${distributionId}`
        ))
        .switchMap(distributionId => broiler.invalidateCloudFront$(distributionId))
        .toPromise()
    ;
});

/**
 * Upload the static assets to Amazon S3.
 */
gulp.task('deploy:assets', ['build', 'cloudformation:deploy', 'cloudformation:invalidate'], () => {
    const stage = getStage();
    const appStageName = `${siteConfig.appName}-${stage}`;
    return broiler.getStackOutput$(appStageName)
        .map(output => output.AssetsS3BucketName)
        .switchMap(bucketName => uploadFilesToS3Bucket$(
            bucketName, src$(['dist/**/*', '!dist/**/*.html']), staticAssetsCacheDuration
        ))
        .toPromise()
    ;
});

/**
 * Upload the HTML files to Amazon S3.
 */
gulp.task('deploy:html', ['deploy:assets'], () => {
    const stage = getStage();
    const appStageName = `${siteConfig.appName}-${stage}`;
    return broiler.getStackOutput$(appStageName)
        .map(output => output.SiteS3BucketName)
        .switchMap(bucketName => uploadFilesToS3Bucket$(
            bucketName, src$(['dist/**/*.html']), staticHtmlCacheDuration
        ))
        .toPromise()
    ;
});

/**
 * Deploy the static website to Amazon S3.
 */
gulp.task('deploy', ['deploy:html'], () => {
    const stage = getStage();
    const stageConfig = siteConfig.stages[stage];
    const siteDomain = stageConfig.siteDomain;
    gutil.log('[deploy]', `The website is successfully deployed! It is available at: https://${siteDomain}`);
});

// By default run the webpack-dev-server
gulp.task('default', ['serve']);

/**
 * Returns the parameters for a CloudFormation deployment.
 */
function getCloudFrontDeploymentParameters(stage, appStageName) {
    const stageConfig = siteConfig.stages[stage];
    const siteDomain = stageConfig.siteDomain;
    const assetsDomain = stageConfig.assetsDomain;
    const siteHostedZoneName = /([^.]+\.[^.]+)$/.exec(siteDomain)[0];
    const assetsHostedZoneName = /([^.]+\.[^.]+)$/.exec(assetsDomain)[0];
    return {
        ServiceName: appStageName,
        SiteDomainName: siteDomain,
        SiteHostedZoneName: siteHostedZoneName,
        AssetsDomainName: assetsDomain,
        AssetsHostedZoneName: assetsHostedZoneName,
    };
}

function getStage() {
    const stage = argv.stage;
    if (!stage) {
        throw new Error('The --stage parameter is required');
    }
    return stage;
}

function uploadFilesToS3Bucket$(bucketName, file$, cacheDuration) {
    return file$
        .filter(file => !file.isDirectory())
        .mergeMap(file => {
            gutil.log('[deploy:assets]', `Uploading file ${file.relative}...`);
            return broiler.uploadFileToS3Bucket$(
                bucketName, file, 'public-read', cacheDuration
            ).do(() => gutil.log('[deploy:assets]', gutil.colors.green(`Successfully uploaded ${file.relative}`)));
        }, 3)
    ;
}
