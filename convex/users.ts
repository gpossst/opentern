import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * User Management Functions
 *
 * This module handles user profile operations and subscription management.
 * Includes functions for retrieving user data and managing payment/subscription status.
 */

/**
 * Retrieves the current authenticated user's profile information
 *
 * @returns User profile data including subscription status and payment information
 */
export const getUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    // Get user profile from database
    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Adds a payment provider customer ID to the user's profile
 *
 * This is typically called when a user subscribes to a paid plan.
 * The customer ID is used to manage billing and subscription status
 * with the payment provider (e.g., Stripe, Polar).
 *
 * @param customerId - Payment provider customer ID
 * @returns The customer ID that was added
 */
export const addUserCustomerId = mutation({
  args: { customerId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }

    // Update user profile with customer ID
    await ctx.db.patch(userId, { customerId: args.customerId });
    return args.customerId;
  },
});

/**
 * Updates a user's subscription status
 *
 * This function is typically called by webhook handlers from payment providers
 * when subscription status changes (e.g., payment succeeds, fails, or is cancelled).
 *
 * @param userId - ID of the user to update
 * @param status - Subscription status ("active" for pro, anything else for basic)
 * @returns The status that was set
 */
export const setUserSubscription = mutation({
  args: { userId: v.id("users"), status: v.string() },
  handler: async (ctx, args) => {
    // Verify the user exists
    const userId = await ctx.db.get(args.userId);
    if (!userId) {
      throw new Error("User not found");
    }

    // Update subscription tier based on status
    if (args.status === "active") {
      await ctx.db.patch(args.userId, { sub: "pro" });
    } else {
      await ctx.db.patch(args.userId, { sub: "basic" });
    }

    return args.status;
  },
});

/**
 * Removes a user's customer ID and downgrades to basic subscription
 *
 * This function is typically called when a subscription is cancelled
 * or payment fails. It removes the payment provider customer ID and
 * downgrades the user to the basic subscription tier.
 *
 * @param userId - ID of the user to update
 */
export const deleteUserCustomerId = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Remove customer ID and downgrade to basic subscription
    await ctx.db.patch(args.userId, { sub: "basic", customerId: undefined });
  },
});
