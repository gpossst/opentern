import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { api } from "./_generated/api";

/**
 * HTTP Router Configuration
 *
 * This module sets up the HTTP router for Convex and registers authentication routes.
 * It enables HTTP endpoints for authentication flows and webhook handling.
 *
 * Routes:
 * - Authentication routes (sign in, sign out, callbacks)
 * - Webhook endpoints for external services
 * - API endpoints for external integrations
 */
const http = httpRouter();

// Register authentication routes (sign in, sign out, OAuth callbacks)
auth.addHttpRoutes(http);

export default http;
