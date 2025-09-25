import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addSuggestions = mutation({
  args: {
    suggestions: v.array(
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

    // Get all existing suggestions across all sources to check for duplicates
    const allExistingSuggestions = await ctx.db.query("suggestions").collect();

    // Filter out suggestions that already exist (same company and title)
    const newSuggestions = args.suggestions.filter(
      (suggestion) =>
        !allExistingSuggestions.some(
          (s) =>
            s.company === suggestion.company && s.title === suggestion.title,
        ),
    );

    await Promise.all(
      newSuggestions.map((suggestion) =>
        ctx.db.insert("suggestions", {
          company: suggestion.company,
          title: suggestion.title,
          location: suggestion.location,
          link: suggestion.applicationLink,
          source: args.source,
          createdAt: suggestion.createdAt || now,
        }),
      ),
    );
  },
});

export const getSuggestions = query({
  args: {
    source: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    company: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (args.search) {
      return await ctx.db
        .query("suggestions")
        .withSearchIndex("search_title", (q) => q.search("title", args.search!))
        .paginate(args.paginationOpts);
    } else if (args.source) {
      return await ctx.db
        .query("suggestions")
        .withIndex("by_source_created", (q) => q.eq("source", args.source!))
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (args.company && args.company.length > 0) {
      // Handle multiple companies by querying each one individually
      const allResults = await Promise.all(
        args.company.map((company) =>
          ctx.db
            .query("suggestions")
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
        .query("suggestions")
        .withIndex("by_createdAt")
        .order("desc")
        .paginate(args.paginationOpts);
    }
  },
});

export const addSuggestionToApplications = mutation({
  args: {
    suggestionId: v.id("suggestions"),
  },
  handler: async (ctx, args) => {
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found!");
    }
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Client is not authenticated!");
    }
    await ctx.db.insert("applications", {
      company: suggestion.company,
      title: suggestion.title,
      userId: userId,
      status: "interested",
      history: [],
      notes: "",
      link: suggestion.link,
      lastUpdated: Date.now(),
      suggestionId: args.suggestionId,
    });
  },
});

export const getCompanies = query({
  handler: async (ctx) => {
    const suggestions = await ctx.db.query("suggestions").collect();
    const companies = [...new Set(suggestions.map((s) => s.company))];
    return companies;
  },
});
