import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addOpportunities = mutation({
  args: {
    opportunities: v.array(
      v.object({
        company: v.string(),
        title: v.string(),
        location: v.optional(v.string()),
        applicationLink: v.optional(v.string()),
        createdAt: v.optional(v.number()),
      }),
    ),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get all existing opportunities across all sources to check for duplicates
    const allExistingOpportunities = await ctx.db
      .query("opportunities")
      .collect();

    // Filter out opportunities that already exist (same company and title)
    const newOpportunities = args.opportunities.filter(
      (opportunity) =>
        !allExistingOpportunities.some(
          (s) =>
            s.company === opportunity.company && s.title === opportunity.title,
        ),
    );

    await Promise.all(
      newOpportunities.map((opportunity) =>
        ctx.db.insert("opportunities", {
          company: opportunity.company,
          title: opportunity.title,
          location: opportunity.location,
          link: opportunity.applicationLink,
          source: args.source,
          createdAt: opportunity.createdAt || now,
        }),
      ),
    );
  },
});

export const getOpportunities = query({
  args: {
    source: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    company: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (args.search) {
      return await ctx.db
        .query("opportunities")
        .withSearchIndex("search_title", (q) => q.search("title", args.search!))
        .paginate(args.paginationOpts);
    } else if (args.source) {
      return await ctx.db
        .query("opportunities")
        .withIndex("by_source_created", (q) => q.eq("source", args.source!))
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (args.company && args.company.length > 0) {
      // Handle multiple companies by querying each one individually
      const allResults = await Promise.all(
        args.company.map((company) =>
          ctx.db
            .query("opportunities")
            .withIndex("by_company", (q) => q.eq("company", company))
            .collect(),
        ),
      );

      // Flatten and sort by createdAt descending
      const flattened = allResults
        .flat()
        .sort((a, b) => b.createdAt - a.createdAt);

      // Manual pagination
      const start = args.paginationOpts.cursor
        ? parseInt(args.paginationOpts.cursor)
        : 0;
      const end = start + args.paginationOpts.numItems;
      const page = flattened.slice(start, end);

      return {
        page,
        isDone: end >= flattened.length,
        continueCursor: end < flattened.length ? end.toString() : "",
      };
    } else {
      return await ctx.db
        .query("opportunities")
        .withIndex("by_createdAt")
        .order("desc")
        .paginate(args.paginationOpts);
    }
  },
});

export const addSuggestionToApplications = mutation({
  args: {
    opportunityId: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) {
      throw new Error("Suggestion not found!");
    }
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Client is not authenticated!");
    }
    await ctx.db.insert("applications", {
      company: opportunity.company,
      title: opportunity.title,
      userId: userId,
      status: "interested",
      history: [],
      notes: "",
      link: opportunity.link,
      lastUpdated: Date.now(),
      opportunityId: args.opportunityId,
    });
  },
});

export const getCompanies = query({
  handler: async (ctx) => {
    const opportunities = await ctx.db.query("opportunities").collect();
    const companies = [...new Set(opportunities.map((s) => s.company))];
    return companies;
  },
});
