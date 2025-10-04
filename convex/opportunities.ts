import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Opportunities Management Functions
 *
 * This module handles job opportunities from various sources (LinkedIn, Indeed, etc.).
 * Includes functions for adding opportunities, querying with filters, and converting
 * opportunities to applications.
 */

/**
 * Adds multiple job opportunities to the database
 *
 * Filters out duplicate opportunities (same company and title) before inserting.
 * This prevents the same job posting from being added multiple times.
 *
 * @param opportunities - Array of opportunity objects to add
 * @param source - Source of the opportunities (e.g., "linkedin", "indeed")
 */
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

    // Get all existing opportunities to check for duplicates
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

    // Insert new opportunities in parallel for better performance
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

/**
 * Retrieves job opportunities with various filtering options
 *
 * Supports multiple query modes:
 * - Search by title text
 * - Filter by source
 * - Filter by company names
 * - Default: all opportunities ordered by creation date
 *
 * @param source - Filter by opportunity source (optional)
 * @param paginationOpts - Pagination configuration
 * @param search - Search term for job titles (optional)
 * @param company - Array of company names to filter by (optional)
 * @returns Paginated results based on the query mode
 */
export const getOpportunities = query({
  args: {
    source: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    company: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Search mode: full-text search on job titles
    if (args.search) {
      return await ctx.db
        .query("opportunities")
        .withSearchIndex("search_title", (q) => q.search("title", args.search!))
        .paginate(args.paginationOpts);
    }
    // Source filter mode: opportunities from specific source
    else if (args.source) {
      return await ctx.db
        .query("opportunities")
        .withIndex("by_source_created", (q) => q.eq("source", args.source!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    // Company filter mode: opportunities from specific companies
    else if (args.company && args.company.length > 0) {
      // Query each company individually and combine results
      const allResults = await Promise.all(
        args.company.map((company) =>
          ctx.db
            .query("opportunities")
            .withIndex("by_company", (q) => q.eq("company", company))
            .collect(),
        ),
      );

      // Flatten and sort by creation date (newest first)
      const flattened = allResults
        .flat()
        .sort((a, b) => b.createdAt - a.createdAt);

      // Manual pagination for combined results
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
    }
    // Default mode: all opportunities ordered by creation date
    else {
      return await ctx.db
        .query("opportunities")
        .withIndex("by_createdAt")
        .order("desc")
        .paginate(args.paginationOpts);
    }
  },
});

/**
 * Converts a job opportunity into an application
 *
 * When a user decides to apply for a job opportunity, this function creates
 * a new application record linked to the original opportunity. This maintains
 * the connection between the opportunity and the resulting application.
 *
 * @param opportunityId - ID of the opportunity to convert to application
 */
export const addSuggestionToApplications = mutation({
  args: {
    opportunityId: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    // Verify the opportunity exists
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) {
      throw new Error("Suggestion not found!");
    }

    // Verify user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Client is not authenticated!");
    }

    // Create new application from the opportunity
    await ctx.db.insert("applications", {
      company: opportunity.company,
      title: opportunity.title,
      userId: userId,
      status: "interested", // Start with "interested" status
      history: [],
      notes: "",
      link: opportunity.link,
      lastUpdated: Date.now(),
      opportunityId: args.opportunityId, // Link back to the original opportunity
    });
  },
});

/**
 * Gets a list of all unique company names from opportunities
 *
 * This function is used to populate company filter dropdowns and
 * provide autocomplete suggestions for company-based searches.
 *
 * @returns Array of unique company names
 */
export const getCompanies = query({
  handler: async (ctx) => {
    // Get all opportunities
    const opportunities = await ctx.db.query("opportunities").collect();

    // Extract unique company names using Set
    const companies = [...new Set(opportunities.map((s) => s.company))];
    return companies;
  },
});
