import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    const user = await ctx.db.get(userId);
    return user;
  },
});

export const addUserCustomerId = mutation({
  args: { customerId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, { customerId: args.customerId });
    return args.customerId;
  },
});

export const setUserSubscription = mutation({
  args: { userId: v.id("users"), status: v.string() },
  handler: async (ctx, args) => {
    const userId = await ctx.db.get(args.userId);
    if (!userId) {
      throw new Error("User not found");
    }

    if (args.status === "active") {
      await ctx.db.patch(args.userId, { sub: "pro" });
    } else {
      await ctx.db.patch(args.userId, { sub: "basic" });
    }

    return args.status;
  },
});

export const deleteUserCustomerId = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { sub: "basic", customerId: undefined });
  },
});
