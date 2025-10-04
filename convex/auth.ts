import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

/**
 * Authentication Configuration
 *
 * This module configures Convex Auth with Google OAuth provider.
 * Exports authentication functions and utilities for use throughout the application.
 *
 * Authentication Flow:
 * 1. User clicks sign in
 * 2. Redirected to Google OAuth
 * 3. Google returns user info
 * 4. Convex Auth creates/updates user session
 * 5. User is authenticated and redirected back to app
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google], // Currently only Google OAuth is supported
});
