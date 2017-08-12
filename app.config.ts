import { IAppConfig } from 'broilerkit';
/**
 * Configuration for the web app.
 */
const appConfig: IAppConfig = {
    /**
     * The name of the web app. Should include only
     * letters, number, and dashes.
     */
    name: 'broilerplate',
    /**
     * Which version of BroilerKit is this app using?
     */
    broilerKitVersion: '0',
    /**
     * The AWS region to which the web app will be deployed.
     */
    region: 'us-east-1',
    /**
     * The folder containing all the source files for your app.
     */
    sourceDir: 'src',
    /**
     * Icon file for your app that is used to generate favicons and mobile-compatible
     * icons. The path is relative to the source directory.
     */
    iconFile: 'images/broilerplate.png',
    // Available stages and their configuration
    stages: {
        /**
         * The primary public production version of the app.
         */
        prod: {
            // Domain where the HTML pages are hosted
            siteOrigin: 'https://broilerplate.kii.ski',
            // Domain where all the indefinitely-cached static assets are hosted
            assetsOrigin: 'https://broilerplate.static.kii.ski',
        },
        /**
         * The development version of the app.
         */
        dev: {
            // Domain where the HTML pages are hosted
            siteOrigin: 'https://broilerplate-dev.kii.ski',
            // Domain where all the indefinitely-cached static assets are hosted
            assetsOrigin: 'https://broilerplate-dev.static.kii.ski',
        },
        /**
         * The locally run development server.
         * NOTE: If you change them, you also must ensure, that your /etc/hosts
         * file defines the corresponding aliases for 127.0.0.1
         */
        local: {
            // Domain where the HTML pages are hosted
            siteOrigin: 'http://localhost:1111',
            // Domain where all the indefinitely-cached static assets are hosted
            assetsOrigin: 'http://localhost:1111',
        },
    },
    // Web page configuration
    pages: [{
        title: 'Broilerplate',
        file: 'index.pug',
        scripts: ['index.ts'],
    }, {
        title: 'Page not found!',
        file: 'error.pug',
        scripts: ['index.ts'],
    }],
};

export = appConfig;
