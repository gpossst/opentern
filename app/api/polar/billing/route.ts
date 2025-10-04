import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";
import { getCustomerId } from "../../../../utils/customerId";

/**
 * Polar Customer Portal API Route
 *
 * This route provides access to the Polar customer portal where users can
 * manage their subscriptions, billing information, and payment methods.
 * It integrates with Convex Auth for user authentication and uses the
 * shared getCustomerId utility function.
 *
 * Flow:
 * 1. Authenticate user with Convex Auth
 * 2. Get or create Polar customer ID using shared utility
 * 3. Redirect to Polar customer portal
 *
 * Environment Variables Required:
 * - POLAR_ACCESS_TOKEN: Polar API access token
 */
export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async (req: NextRequest) => {
    try {
      return await getCustomerId(req);
    } catch (error) {
      // If there's an error getting the customer ID, throw it
      // This will cause the CustomerPortal to return an error response
      throw error;
    }
  },
  server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
});
