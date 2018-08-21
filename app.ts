import { app } from 'broilerkit';

/**
 * Configuration for the web app.
 */
export default app({
    /**
     * The name of the web app. Should include only
     * letters, number, and dashes.
     */
    name: 'movie-polls',
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
    iconFile: 'images/icon.png',
    // Available stages and their configuration
    stages: {
        /**
         * The primary public production version of the app.
         */
        prod: {
            // Root URL where the HTML pages are hosted
            siteRoot: 'https://movies.kii.ski',
            // Root URL where all the indefinitely-cached static assets are hosted
            assetsRoot: 'https://movies.static.kii.ski',
            // Root URL where the API is served
            apiRoot: 'https://api.movies.kii.ski',
        },
        /**
         * The development version of the app.
         */
        dev: {
            // Root URL where the HTML pages are hosted
            siteRoot: 'https://movies-dev.kii.ski',
            // Root URL where all the indefinitely-cached static assets are hosted
            assetsRoot: 'https://movies-dev.static.kii.ski',
            // Root URL where the API is served
            apiRoot: 'https://api.movies-dev.kii.ski',
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
     * Configuration for the user registry.
     */
    auth: {
        /**
         * The Facebook client ID for sign in.
         * Enabling this will enable Facebook login possibility.
         */
        facebookClientId: '384663901694196',
        /**
         * The Google client ID for sign in.
         * Enabling this will enable Facebook login possibility.
         */
        googleClientId: '431731426517-ifl7gufshhv9e0f12nf3m0h3ck8ivomp.apps.googleusercontent.com',
    },
    /**
     * Additional parameters your backend requires to work.
     * You will be asked to set up these for each environment.
     */
    parameters: {
        TMDBApiKey: {
            description: 'API key for the The Movie Database',
        },
    },
    /**
     * The API endpoints for this app.
     */
    serverFile: 'server.ts',
    // Web page configuration
    pages: [{
        title: 'Movie polls',
        file: 'index.pug',
        scripts: ['index.tsx'],
    }, {
        title: 'Page not found!',
        file: 'error.pug',
        scripts: ['index.tsx'],
    }],
    /**
     * Optional default web page that will be served when no web page file
     * is found by the requested URL. If null or undefined, an 404 error page will be
     * shown. Otherwise, the defined file will be served with 200 response.
     *
     * This is useful for single page apps using HTML5 History API.
     */
    defaultPage: 'index.html',
});
