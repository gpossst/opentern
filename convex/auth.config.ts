/**
 * Authentication Configuration Export
 *
 * This file exports the authentication configuration for Convex Auth.
 * It defines the application domain and ID used for OAuth provider setup.
 *
 * Configuration:
 * - domain: The site URL where the app is hosted
 * - applicationID: Identifier for this application in the auth system
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL, // Site URL from environment variables
      applicationID: "opentern", // Application identifier
    },
  ],
};
