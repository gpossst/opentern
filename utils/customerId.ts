import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { Polar } from "@polar-sh/sdk";
import { api } from "../convex/_generated/api";
import { NextRequest } from "next/server";

/**
 * Utility function to get or create a Polar customer ID for the authenticated user
 *
 * This shared utility function handles the complete customer ID management flow
 * and is used by multiple API routes that need Polar customer integration.
 *
 * Process Flow:
 * 1. Authenticate user with Convex Auth
 * 2. Initialize Polar API client (sandbox environment)
 * 3. Initialize Convex client with authentication
 * 4. Get current user information from Convex database
 * 5. Check if user already has a customer ID
 * 6. If no customer ID exists:
 *    - Create new customer in Polar with user's email and Convex user ID
 *    - Store the new customer ID in Convex database
 * 7. Return the customer ID (existing or newly created)
 *
 * Error Handling:
 * - Throws "Unauthorized" if authentication fails
 * - Throws "User not found" if user doesn't exist in Convex
 * - Throws "Error creating customerId" if Polar customer creation fails
 *
 * @param request - HTTP request object (can be NextRequest or regular Request)
 * @returns Promise<string> - The customer ID
 * @throws Error if authentication fails, user not found, or customer creation fails
 */
export async function getCustomerId(
  request: Request | NextRequest,
): Promise<string> {
  // Step 1: Authenticate user with Convex Auth
  // This extracts the JWT token from the request headers
  const token = await convexAuthNextjsToken();

  if (!token) {
    throw new Error("Unauthorized");
  }

  // Step 2: Initialize Polar API client with sandbox environment
  // Using sandbox for development/testing - change to production for live environment
  const polarApi = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: "sandbox", // Using sandbox for development
  });

  // Step 3: Initialize Convex client with authentication
  // This allows us to query the Convex database with user context
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  convex.setAuth(token);

  // Step 4: Get current user information from Convex database
  // This retrieves the authenticated user's profile data
  const user = await convex.query(api.users.getUser);

  if (!user || !user.email || !user._id) {
    throw new Error("User not found");
  }

  // Step 5: Check if user already has a Polar customer ID
  let customerId = user.customerId;

  if (!customerId) {
    // Step 6a: Create new customer in Polar if one doesn't exist
    // This creates a customer record in Polar's system linked to our Convex user
    customerId = await polarApi.customers
      .create({
        email: user.email, // Customer's email address
        externalId: user._id, // Link to Convex user ID for future reference
      })
      .then((customer) => customer.id);

    if (!customerId) {
      throw new Error("Error creating customerId");
    }

    // Step 6b: Store the new customer ID in Convex database
    // This ensures we don't need to create the customer again in future requests
    await convex.mutation(api.users.addUserCustomerId, { customerId });
  }

  // Step 7: Return the customer ID (existing or newly created)
  return customerId;
}
