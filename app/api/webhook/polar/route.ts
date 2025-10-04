// src/app/api/webhook/polar/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Polar Webhook Handler API Route
 *
 * This route handles webhook events from Polar payment system.
 * It processes subscription lifecycle events and updates user
 * subscription status in the Convex database accordingly.
 *
 * Supported Events:
 * - subscription.created: New subscription activated
 * - subscription.updated: Subscription status changed
 * - customer.deleted: Customer account deleted
 *
 * Environment Variables Required:
 * - POLAR_WEBHOOK_SECRET: Webhook secret for verification
 * - NEXT_PUBLIC_CONVEX_URL: Convex deployment URL
 */

/**
 * POST handler for Polar webhook events
 *
 * Processes incoming webhook events from Polar and updates
 * user subscription status in the database.
 *
 * @param request - HTTP request containing webhook payload
 * @returns Response indicating webhook processing result
 */
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  /**
   * Handles subscription creation events
   *
   * When a new subscription is created in Polar, this handler
   * updates the user's subscription status in Convex.
   *
   * @param subscription - Subscription data from Polar webhook
   */
  onSubscriptionCreated: async (subscription) => {
    const userId = subscription.data.customer.externalId;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    if (!userId) {
      return;
    }

    // Update user subscription status in Convex database
    await convex.mutation(api.users.setUserSubscription, {
      userId: userId as Id<"users">,
      status: subscription.data.status,
    });
  },

  /**
   * Handles subscription update events
   *
   * When a subscription status changes (e.g., payment failed,
   * subscription cancelled), this handler updates the user's
   * subscription status accordingly.
   *
   * @param subscription - Updated subscription data from Polar webhook
   */
  onSubscriptionUpdated: async (subscription) => {
    const userId = subscription.data.customer.externalId;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    if (!userId) {
      return;
    }

    // Update user subscription status in Convex database
    await convex.mutation(api.users.setUserSubscription, {
      userId: userId as Id<"users">,
      status: subscription.data.status,
    });
  },

  /**
   * Handles customer deletion events
   *
   * When a customer account is deleted in Polar, this handler
   * removes the customer ID and downgrades the user to basic
   * subscription in Convex.
   *
   * @param customer - Customer data from Polar webhook
   */
  onCustomerDeleted: async (customer) => {
    const userId = customer.data.externalId;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    if (!userId) {
      return;
    }

    // Remove customer ID and downgrade to basic subscription
    await convex.mutation(api.users.deleteUserCustomerId, {
      userId: userId as Id<"users">,
    });
  },
});
