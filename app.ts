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
   * Human-readable title for the app.
   */
  title: 'Movie Polls',
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
      // The AWS region to which the web app will be deployed.
      region: 'us-east-1',
      // Root URL where the website is hosted
      serverRoot: 'https://movies.kii.ski',
      // Root URL where all the indefinitely-cached static assets are hosted
      assetsRoot: 'https://movies.static.kii.ski',
    },
    /**
     * The development version of the app.
     */
    dev: {
      // The AWS region to which the web app will be deployed.
      region: 'us-east-1',
      // Root URL where the website is hosted
      serverRoot: 'https://movies-dev.kii.ski',
      // Root URL where all the indefinitely-cached static assets are hosted
      assetsRoot: 'https://movies-dev.static.kii.ski',
    },
    /**
     * The locally run development server.
     * NOTE: If you change them, you also must ensure, that your /etc/hosts
     * file defines the corresponding aliases for 127.0.0.1
     */
    local: {
      // The special region code for local development
      region: 'local',
      // Root URL where the website is served
      serverRoot: 'http://localhost:1111',
      // Root URL where all the local static assets are served
      assetsRoot: 'http://localhost:1112',
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
  /**
   * The website file for this app.
   */
  siteFile: 'App.tsx',
});
