import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { statusUnion } from "./unions";

export const getApplications = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return applications;
  },
});

export const createApplication = mutation({
  args: {
    company: v.string(),
    title: v.string(),
    status: v.optional(statusUnion),
    history: v.optional(
      v.array(
        v.object({
          date: v.number(),
          status: statusUnion,
        }),
      ),
    ),
    notes: v.optional(v.string()),
    link: v.optional(v.string()),
    lastUpdated: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    const application = await ctx.db.insert("applications", {
      userId: userId,
      company: args.company,
      title: args.title,
      status: args.status || "interested",
      history: args.history || undefined,
      notes: args.notes || undefined,
      link: args.link || undefined,
      lastUpdated: args.lastUpdated || undefined,
    });
    return application;
  },
});
