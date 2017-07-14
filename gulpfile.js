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
    const stage = getStage();
    const stageConfig = siteConfig.stages[stage];
    const assetsDomain = stageConfig.assetsDomain;
    const baseUrl = `https://${assetsDomain}/`;
    const webpackConfig = createWebpackConfig({ baseUrl, debug });
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
    const baseUrl = `http://${host}:${port}/`;
    const webpackConfig = createWebpackConfig(({ debug, baseUrl, devServer: true }));
    const serverConfig = webpackConfig.devServer;
    const host = serverConfig.host;
    const port = serverConfig.port;
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
gulp.task('cloudformation', [], (callback) => {
    const stage = getStage();
    gutil.log('[cloudformation]', `Preparing deployment for the stage "${stage}"`);
    deployCloudFormationStack(stage, callback);
});

/**
 * Upload the static assets to Amazon S3.
 */
gulp.task('deploy:assets', ['build', 'cloudformation'], (callback) => {
    const stage = getStage();
    const appStageName = `${siteConfig.appName}-${stage}`;
    getCloudFormationStackOutput(appStageName, (err, output) => {
        if (err) {
            callback(err, output);
        } else {
            const bucketName = output.AssetsS3BucketName;
            gutil.log('[deploy:assets]', `Uploading static assets for stage "${stage}" to S3 bucket "${bucketName}"`);
            uploadFilesToS3Bucket(bucketName, ['dist/**/*', '!dist/**/*.html'], staticAssetsCacheDuration, callback);
        }
    });
});

/**
 * Upload the HTML files to Amazon S3.
 */
gulp.task('deploy:html', ['deploy:assets'], callback => {
    const stage = getStage();
    const appStageName = `${siteConfig.appName}-${stage}`;
    getCloudFormationStackOutput(appStageName, (err, output) => {
        if (err) {
            callback(err, output);
        } else {
            const bucketName = output.SiteS3BucketName;
            gutil.log('[deploy:assets]', `Uploading HTML pages for stage "${stage}" to S3 bucket "${bucketName}"`);
            uploadFilesToS3Bucket(bucketName, ['dist/**/*.html'], staticHtmlCacheDuration, callback);
        }
    });
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
 * Describes the given stack.
 * @param {string} stackName Name of the CloudFormation stack
 * @param {Function} callback Function to be called with the result
 */
function describeCloudFormationStack(stackName, callback) {
    cloudFormation.describeStacks({ StackName: stackName }, (err, data) =>
        callback(err, err ? data : data && data.Stacks[0])
    );
}

/**
 * Retrieves the outputs of the given CloudFormation stack.
 * The outputs are represented as an object, where keys are the
 * output keys, and values are the output values.
 * @param {string} stackName Name of the CloudFormation stack
 * @param {Function} callback Function to be called with the result
 */
function getCloudFormationStackOutput(stackName, callback) {
    describeCloudFormationStack(stackName, (err, data) => {
        if (err) {
            callback(err, data);
        } else {
            const outputs = _.fromPairs(data.Outputs.map(
                ({OutputKey, OutputValue}) => [OutputKey, OutputValue])
            );
            callback(null, outputs);
        }
    })
}

/**
 * Checks whether or not a CloudFormation stack with the given name
 * exists, calling the given callback with a boolean value as a result.
 * @param {string} stackName Name of the CloudFormation stack to check
 * @param {Function} callback Function to be called with the result
 */
function checkCloudFormationStackExists(stackName, callback) {
    describeCloudFormationStack(stackName, (describeErr) => {
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
    cloudFormation.createStack({
        StackName: appStageName,
        TemplateBody: cloudFormationTemplate,
        OnFailure: 'ROLLBACK',
        Capabilities: [
            'CAPABILITY_IAM',
            'CAPABILITY_NAMED_IAM',
        ],
        Parameters: getCloudFrontDeploymentParameters(stage, appStageName),
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
    cloudFormation.updateStack({
        StackName: appStageName,
        TemplateBody: cloudFormationTemplate,
        Capabilities: [
            'CAPABILITY_IAM',
            'CAPABILITY_NAMED_IAM',
        ],
        Parameters: getCloudFrontDeploymentParameters(stage, appStageName),
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

/**
 * Uploads files matching the given patterns to a Amazon S3 bucket.
 * @param {string} bucketName Name of the S3 bucket to uplaod the files
 * @param {string[]} patterns Glob patters matching the files to upload (passed to gulp.src)
 * @param {number} cacheDuration Number of seconds for caching the files
 * @param {Function} callback Function to call after the upload
 */
function uploadFilesToS3Bucket(bucketName, patterns, cacheDuration, callback) {
    const stream = gulp.src(patterns).pipe(s3({
        Bucket: bucketName,
        ACL: 'public-read',
        CacheControl: `max-age=${cacheDuration}`,
    }));
    stream.on('end', event => callback(null, event));
    stream.on('error', error => callback(error, null));
}

/**
 * Returns the parameters for a CloudFormation deployment.
 */
function getCloudFrontDeploymentParameters(stage, appStageName) {
    const stageConfig = siteConfig.stages[stage];
    const siteDomain = stageConfig.siteDomain;
    const assetsDomain = stageConfig.assetsDomain;
    const siteHostedZoneName = /([^.]+\.[^.]+)$/.exec(siteDomain)[0];
    const assetsHostedZoneName = /([^.]+\.[^.]+)$/.exec(assetsDomain)[0];
    const parameters = {
        ServiceName: appStageName,
        SiteDomainName: siteDomain,
        SiteHostedZoneName: siteHostedZoneName,
        AssetsDomainName: assetsDomain,
        AssetsHostedZoneName: assetsHostedZoneName,
    };
    return _.map(parameters, (ParameterValue, ParameterKey) => ({ParameterKey, ParameterValue}));
}

function getStage() {
    const stage = argv.stage;
    if (!stage) {
        throw new Error('The --stage parameter is required');
    }
    return stage;
}
