import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
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
      .order("desc")
      .collect();
    return applications;
  },
});

export const createApplication = mutation({
  args: {
    company: v.string(),
    title: v.string(),
    status: v.optional(statusUnion),
    history: v.optional(v.array(statusUnion)),
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

export const insertApplications = internalMutation({
  args: {
    applications: v.array(
      v.object({
        company: v.string(),
        title: v.string(),
        link: v.optional(v.string()),
        notes: v.optional(v.string()),
        status: v.union(
          v.literal("interested"),
          v.literal("applied"),
          v.literal("assessment"),
          v.literal("interviewed"),
          v.literal("offered"),
          v.literal("rejected"),
          v.literal("archived"),
        ),
      }),
    ),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.applications.map((application) =>
        ctx.db.insert("applications", {
          ...application,
          userId: args.userId,
          lastUpdated: Date.now(),
        }),
      ),
    );
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("applications"),
    status: statusUnion,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    const application = await ctx.db.get(args.id);

    if (application?.userId !== userId) {
      throw new Error("Client is not authorized to update this application!");
    }

    if (args.status === application.status) {
      throw new Error("Application status is already set to this status!");
    }

    const updatedApplication = await ctx.db.patch(args.id, {
      status: args.status,
      history: [...(application.history || []), args.status],
      lastUpdated: Date.now(),
    });

    return "success";
  },
  returns: v.string(),
});

export const getSuggestedApplications = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const applicationsFromSuggestions = applications.filter(
      (application) => application.suggestionId != null,
    );

    console.log("Applications from suggestions", applicationsFromSuggestions);

    const suggestionIds = applicationsFromSuggestions.map(
      (application) => application.suggestionId!,
    );

    return suggestionIds;
  },
});
