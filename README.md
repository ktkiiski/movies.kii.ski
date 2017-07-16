# Broilerplate

![Broilerplate](./src/images/broilerplate.png)

This is a boilerplate for quickly bootstrapping a static web app with modern technologies, deployed to a scalable, production-ready environment! You can write your scripts in [TypeScript](http://www.typescriptlang.org/) and stylesheets in [SASS](http://sass-lang.com/), and they will be compiled into ES5 JavaScript and CSS using [Webpack](https://webpack.js.org/).

The boilerplate includes scripts to deploy your production-ready web app to [Amazon Web Services cloud platform](https://aws.amazon.com/), with minimal setup and very low costs! The hosting is almost free on low-traffic sites.

(**Disclaimer:** By using this utility you are taking the responsibility for any incurring expenses.)

### Development features

- Write your scripts in [TypeScript](http://www.typescriptlang.org/)
- Write your stylesheets in [SASS](http://sass-lang.com/)
- Lint your JavaScript code style with [ESLint](http://eslint.org/)
- Lint your TypeScript code style with [TSLint](https://palantir.github.io/tslint/)
- Generate static HTML pages from [Pug](https://pugjs.org/) templates
- Automatically bundle any images from your HTML, Pug, or Markdown files.
- Automatically **optimize images losslessly** for minimal size
- Include Markdown to your Pug templates. You may [include with filters](https://pugjs.org/language/includes.html#including-filtered-text) but `!= require("foo.md")` is preferred because it will also require any images.
- Generate favicons and related asset files from a single icon image file, and insert references to the HTML pages
- Refer to your current GIT version with `__COMMIT_HASH__`, `__VERSION__` and `__BRANCH__` constants

### Deployment features

- Deploy your compressed, production-ready web app to [AWS platform](https://aws.amazon.com/), hosted on [S3](https://aws.amazon.com/s3/), served globally through [CloudFront](https://aws.amazon.com/cloudfront/), and managed with [CloudFormation](https://aws.amazon.com/cloudformation/)
- Make your app available on your **custom domain** (_required_)
- Host static assets on separate cookieless domain with infinite caching, for maximum performance scoring and reliability
- Separate **stages** for your released production version (`prod`) and the development version (`dev`)

## Installing

To apply this template:

```bash
git remote add template https://github.com/ktkiiski/broilerplate.git
git pull template master --allow-unrelated-histories
```

Remember to add your project metadata to the [`package.json`](./package.json), for example, `name`, `author`, `description`.

You need to install the required node packages:

```bash
npm install
```

If installing fails on OSX [you may try to install libpng with Homebrew](https://github.com/tcoopman/image-webpack-loader#libpng-issues).

## Running locally

To run the app locally, start the local HTTP server and the build watch process:

```bash
npm start
```

Then navigate your browser to http://0.0.0.0:1111/

The web page is automatically reloaded when the app is re-built.

## Build

You can compile all the files as they would be built for the deployments. The built files are placed to a `dist` folder, located at the root of your project.

To build the files for development (the `dev` stage), run:

```bash
npm run build:dev
```

To build for production (the `prod` stage):

```bash
npm run build:prod
```

You may optionally add the `:debug` suffixes to the commands. In this case, the files are compiled faster, skipping any minification, compression and some other additional steps.

```bash
npm run build:dev:debug
npm run build:prod:debug
```

## Deployment

### Prerequisities

#### Set up AWS credentials

To deploy the web app, you first need to set up your AWS credentials.
This can be done with [`aws-cli` command line tool](https://github.com/aws/aws-cli):

```bash
# Install if not already installed
pip install awscli
# Optional: enable command line completion
complete -C aws_completer aws
# Configure your credentials
aws configure
```

#### Create a Hosted Zone

NOTE: You need to [create a Hosted Zone for Amazon Route53](http://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html#root-domain-walkthrough-switch-to-route53-as-dnsprovider) first for your custom domain first! Also, if you are using other domain name provider, such as GoDaddy, then you need to set up the DNS records for your domain.

#### Configure stages

You should change the configuration in [`site.config.json`](./site.config.json) according to your website's needs.

- `appName`: A distinct name of your app. Recommended to be in lower case and separate words with dashes, because the name will be used in Amazon resource names and internal host names.
- `stages`: Configuration for each different stage that your app has. By default there are `dev` stage for a development version and `prod` stage for the production version. You should change the `siteDomain` and `assetsDomain` to the domain names that you would like to use for each stage.

### Running deployment

Deploy the development version to the `dev` stage:

    npm run deploy:dev

Deploy the production version to the `prod` stage:

    npm run deploy:prod

**IMPORTANT:** When deploying for the first time, you will receive email for confirming the certificate for the domain names!
The deployment continues only after you approve the certificate!

The deployment will clean the build directory (`dist`), removing its contents, build your app files, and then upload it to S3.

The assets (JavaScript, CSS, images) are uploaded first. Their names will contain hashes, so they won't conflict with existing files.
They will be cached infinitely with HTTP headers.
The HTML files are uploaded last and they are cached for a short time.

## Upgrading node packages

Pro-tip: Use [`npm-check-updates`](https://github.com/tjunnone/npm-check-updates) command line utility to upgrade the npm packages.
