const argv = require('yargs').argv;
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
const s3 = require('gulp-s3-upload')({ signatureVersion: 'v4' });
const AWS = require('aws-sdk');
// TODO: Lock API versions?
const cloudFormation = new AWS.CloudFormation({
    region: siteConfig.region,
});

// Where the CloudFormation template is located
const cloudFormationTemplatePath = path.resolve(__dirname, 'cloudformation.yml');
// Static assets are cached for a year
const staticAssetsCacheDuration = 31556926;
// HTML pages are cached for an hour
const staticHtmlCacheDuration = 3600;
// Whether or not running in debug mode
const debug = process.argv.indexOf('--debug') >= 0;

/**
 * Clean the build folder.
 */
gulp.task('clean', () => del(['dist/**/*']));

/**
 * Build and watch cycle (another option for development)
 * Advantage: No server required, can run app from filesystem.
 * Disadvantage: Requests are not blocked until bundle is available,
 * can serve an old app on refresh.
 */
gulp.task('watch', ['build'], () => {
    gulp.watch(['src/**/*'], ['build']);
});

/**
 * Build the JavaScript and stylesheet assets by
 * using the Webpack 2.
 */
gulp.task('build', ['clean'], callback => {
    const webpackConfig = createWebpackConfig({ debug: debug });
    webpack(webpackConfig).run((err, stats) => {
        if (err) {
            throw new gutil.PluginError('build', err);
        }
        gutil.log('[build]', stats.toString({
            colors: true,
        }));
        callback();
    });
});

/**
 * Serves and auto-reloads with webpack-dev-server.
 */
// eslint-disable-next-line no-unused-vars
gulp.task('serve', callback => {
    const webpackConfig = createWebpackConfig(({ debug: debug, devServer: true }));
    const serverConfig = webpackConfig.devServer;
    const host = serverConfig.host;
    const port = serverConfig.port;
    const url = `http://${host}:${port}/`;
    // Modify the configuration so that the inline livereloading is enabled.
    // See: https://webpack.github.io/docs/webpack-dev-server.html#inline-mode-with-node-js-api
    _.each(webpackConfig.entry, entries => entries.unshift(`webpack-dev-server/client?${url}`));
    new WebpackDevServer(webpack(webpackConfig), serverConfig).listen(port, host, err => {
        if (err) {
            throw new gutil.PluginError('serve', err);
        }
        gutil.log('[serve]', url);
    });
});

/**
 * Create or update the CloudFormation stack.
 */
gulp.task('cloudformation', [], (callback) => {
    const stage = argv.stage;
    if (!stage) {
        throw new Error('The --stage parameter is required');
    }
    gutil.log('[cloudformation]', `Preparing deployment for the stage "${stage}"`);
    deployCloudFormationStack(stage, callback);
});

/**
 * Upload the static assets to Amazon S3.
 */
gulp.task('deploy:assets', ['build'], () =>
    gulp.src(['dist/**/*', '!dist/**/*.html']).pipe(s3({
        Bucket: siteConfig.bucket,
        ACL: 'public-read',
        CacheControl: `max-age=${staticAssetsCacheDuration}`,
    }))
);

/**
 * Upload the HTML files to Amazon S3.
 */
gulp.task('deploy:html', ['deploy:assets'], () =>
    gulp.src(['dist/**/*.html']).pipe(s3({
        Bucket: siteConfig.bucket,
        ACL: 'public-read',
        CacheControl: `max-age=${staticHtmlCacheDuration}`,
    }))
);

/**
 * Deploy the static website to Amazon S3.
 */
gulp.task('deploy', ['deploy:html']);

// By default run the webpack-dev-server
gulp.task('default', ['serve']);

/**
 * Creates or updates a CloudFormation stack for the given stage.
 * @param {string} stage name of the stage to be deployed
 * @param {Function} callback function to be called when finished
 */
function deployCloudFormationStack(stage, callback) {
    const appStageName = `${siteConfig.appName}-${stage}`;
    checkCloudFormationStackExists(appStageName, (checkError, stackExists) => {
        if (checkError) {
            callback(checkError, stackExists);
        } else if (stackExists) {
            // Stack already exists => update the stack
            updateStack(stage, appStageName, callback);
        } else {
            // Stack does not exist => create the stack
            createStack(stage, appStageName, callback);
        }
    })
}

/**
 * Waits for the Cloudformation for the specific state.
 * @param {string} state The CloudFormation state to wait for
 * @param {string} stackName Name of the CloudFormation stack
 * @param {Function} callback Function to call when ready
 */
function waitForCloudFormation(state, stackName, callback) {
    cloudFormation.waitFor(state, { StackName: stackName }, callback);
}

/**
 * Checks whether or not a CloudFormation stack with the given name
 * exists, calling the given callback with a boolean value as a result.
 * @param {string} stackName Name of the CloudFormation stack to check
 * @param {Function} callback Function to be called with the result
 */
function checkCloudFormationStackExists(stackName, callback) {
    cloudFormation.describeStacks({ StackName: stackName }, (describeErr) => {
        if (describeErr) {
            if (describeErr.message.indexOf('does not exist') > -1) {
                callback(null, false);
            } else {
                callback(describeErr, null);
            }
        } else {
            callback(null, true);
        }
    });
}

/**
 * Creates the CloudFormation stack.
 * @param {string} stage Stage of the deployment
 * @param {string} appStageName Name of the CloudFormation stack
 * @param {Function} callback Function to be called after creation
 */
function createStack(stage, appStageName, callback) {
    const cloudFormationTemplate = fs.readFileSync(cloudFormationTemplatePath, 'utf8');
    const stageConfig = siteConfig.stages[stage];
    const siteDomain = stageConfig.siteDomain;
    const assetsDomain = stageConfig.assetsDomain;
    cloudFormation.createStack({
        StackName: appStageName,
        TemplateBody: cloudFormationTemplate,
        OnFailure: 'ROLLBACK',
        Capabilities: [
            'CAPABILITY_IAM',
            'CAPABILITY_NAMED_IAM',
        ],
        Parameters: [{
            ParameterKey: 'ServiceName',
            ParameterValue: appStageName,
        }, {
            ParameterKey: 'SiteDomainName',
            ParameterValue: siteDomain,
        }, {
            ParameterKey: 'AssetsDomainName',
            ParameterValue: assetsDomain,
        }],
    }, (createError, createData) => {
        if (createError) {
            callback(createError, createData);
        } else {
            gutil.log('[cloudformation]', 'Creating the CloudFormation stack...');
            waitForCloudFormation('stackCreateComplete', appStageName, callback);
        }
    });
}

/**
 * Updates the CloudFormation stack.
 * @param {string} stage Stage of the deployment
 * @param {string} appStageName Name of the CloudFormation stack
 * @param {Function} callback Function to be called after creation
 */
function updateStack(stage, appStageName, callback) {
    const cloudFormationTemplate = fs.readFileSync(cloudFormationTemplatePath, 'utf8');
    const stageConfig = siteConfig.stages[stage];
    const siteDomain = stageConfig.siteDomain;
    const assetsDomain = stageConfig.assetsDomain;
    cloudFormation.updateStack({
        StackName: appStageName,
        TemplateBody: cloudFormationTemplate,
        Capabilities: [
            'CAPABILITY_IAM',
            'CAPABILITY_NAMED_IAM',
        ],
        Parameters: [{
            ParameterKey: 'ServiceName',
            ParameterValue: appStageName,
        }, {
            ParameterKey: 'SiteDomainName',
            ParameterValue: siteDomain,
        }, {
            ParameterKey: 'AssetsDomainName',
            ParameterValue: assetsDomain,
        }],
    }, (updateError, updateData) => {
        if (!updateError) {
            gutil.log('[cloudformation]', 'Updating the CloudFormation stack...');
            waitForCloudFormation('stackUpdateComplete', appStageName, callback);
        } else if (updateError.message.indexOf('No updates are to be performed') >= 0) {
            gutil.log('[cloudformation]', 'CloudFormation stack is up-to-date');
            callback(null, updateData);
        } else {
            callback(updateError, updateData);
        }
    });
}
