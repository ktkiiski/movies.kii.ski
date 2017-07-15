# Broilerplate

![Broilerplate](./src/images/broilerplate.png)

This is a boilerplate for creating projects that use Webpack 2 to compile a TypeScript application and SASS stylesheets into a ES5 JavaScript and CSS.

Features:

- Write your scripts in [TypeScript](http://www.typescriptlang.org/)
- Write your stylesheets in [SASS](http://sass-lang.com/)
- Lint your JavaScript code style with [ESLint](http://eslint.org/)
- Lint your TypeScript code style with [TSLint](https://palantir.github.io/tslint/)
- Generate static HTML pages from [Pug](https://pugjs.org/) templates
- Automatically include any images from your HTML, Pug, or Markdown files.
- Include Markdown to your Pug templates. You may [include with filters](https://pugjs.org/language/includes.html#including-filtered-text) but `!= require("foo.md")` is preferred because it will also require any images.

To apply this template:

```bash
git remote add template https://github.com/ktkiiski/broilerplate.git
git pull template master --allow-unrelated-histories
```

Remember to add your project metadata to the [`package.json`](./package.json), for example, `name`, `author`, `description`.

## Running locally

### Prerequisities

You need to install the required node packages:

```bash
npm install
```

If installing fails on OSX [you may try to install libpng with Homebrew](https://github.com/tcoopman/image-webpack-loader#libpng-issues).


### Running development server

To run the app locally, start the local HTTP server and the build watch process:

```bash
npm start
```

Then navigate your browser to http://0.0.0.0:1111/

The web page is automatically reloaded when the app is re-built.

## Build

The built files are placed to a `dist` folder, located at the root of your project.
To build the files for development, run:

```bash
npm run build:dev
```

To build for production:

```bash
npm run build:prod
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

- `appName`: A distinct name of your app. Recommended to be in lower case and separate words with dashes. This will become the name of the service in the Serverless configuration and it will be used in Amazon resource names.
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
