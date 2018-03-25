import { app } from 'broilerkit';

/**
 * Configuration for the web app.
 */
export default app({
    /**
     * The name of the web app. Should include only
     * letters, number, and dashes.
     */
    name: 'broilerplate',
    /**
     * The AWS region to which the web app will be deployed.
     */
    region: 'us-east-1',
    /**
     * The folder containing all the source files for your app.
     * Other paths in this configuration are relative to this.
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
            // Root URL where the HTML pages are hosted
            siteRoot: 'https://broilerplate.kii.ski',
            // Root URL where all the indefinitely-cached static assets are hosted
            assetsRoot: 'https://broilerplate.static.kii.ski',
            // Root URL where the API is served
            apiRoot: 'https://api.broilerplate.kii.ski',
        },
        /**
         * The development version of the app.
         */
        dev: {
            // Root URL where the HTML pages are hosted
            siteRoot: 'https://broilerplate-dev.kii.ski',
            // Root URL where all the indefinitely-cached static assets are hosted
            assetsRoot: 'https://broilerplate-dev.static.kii.ski',
            // Root URL where the API is served
            apiRoot: 'https://api.broilerplate-dev.kii.ski',
        },
        /**
         * The locally run development server.
         * NOTE: If you change them, you also must ensure, that your /etc/hosts
         * file defines the corresponding aliases for 127.0.0.1
         */
        local: {
            // Root URL where the HTML pages are hosted
            siteRoot: 'http://localhost:1111',
            // Root URL where all the indefinitely-cached static assets are hosted
            assetsRoot: 'http://localhost:1111',
            // Root URL where the API is served
            apiRoot: 'http://localhost:1112',
        },
    },
    /**
     * The API endpoints for this app.
     */
    serverFile: 'server.ts',
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
});
