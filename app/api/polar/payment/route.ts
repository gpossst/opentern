import { Polar } from "@polar-sh/sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { getCustomerId } from "../../../../utils/customerId";

/**
 * Payment Checkout API Route
 *
 * This route handles the creation of payment checkout sessions using Polar.
 * It integrates with Convex Auth for user authentication and manages
 * customer creation and subscription checkout flow.
 *
 * Flow:
 * 1. Authenticate user with Convex Auth (handled by getCustomerId utility)
 * 2. Get or create Polar customer ID using shared utility function
 * 3. Store customer ID in Convex database (if newly created)
 * 4. Create checkout session for subscription
 * 5. Return checkout URL for redirect
 *
 * Environment Variables Required:
 * - POLAR_ACCESS_TOKEN: Polar API access token
 * - NEXT_PUBLIC_CONVEX_URL: Convex deployment URL
 */

/**
 * GET handler for payment checkout creation
 *
 * Creates a Polar checkout session for the authenticated user.
 * Uses the shared getCustomerId utility to handle authentication
 * and customer ID management.
 *
 * @param request - HTTP request object
 * @returns Checkout URL for redirect or error response
 */
export const GET = async (request: Request) => {
  // Initialize Convex client for database operations
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  // Initialize Polar API client for checkout session creation
  const polarApi = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: "sandbox", // Using sandbox for development
  });

  let customerId: string;

  try {
    // Get or create customer ID using shared utility function
    // This handles authentication, user lookup, and customer creation
    customerId = await getCustomerId(request);
  } catch (error) {
    // Handle errors from getCustomerId utility (auth failures, user not found, etc.)
    return new Response("Error getting customer ID", { status: 500 });
  }

  // Store the customer ID in Convex database
  // This ensures the customer ID is persisted for future use
  await convex.mutation(api.users.addUserCustomerId, { customerId });

  // Create checkout session for subscription
  const checkoutSession = await polarApi.checkouts.create({
    successUrl: "http://localhost:3000/", // Redirect URL after successful payment
    externalCustomerId: customerId, // Link to our customer ID
    products: ["0c90cf48-b881-43d4-8664-b9547fb1d4e9"], // Product ID for subscription
  });

  // Validate that checkout session was created successfully
  if (!checkoutSession.url) {
    return new Response("Error creating checkout session", { status: 500 });
  }

  // Return the checkout URL for redirect
  // The frontend should redirect the user to this URL to complete payment
  return new Response(checkoutSession.url, { status: 200 });
};
