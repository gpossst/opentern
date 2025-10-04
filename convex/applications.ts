import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { statusUnion } from "./unions";

/**
 * Applications Management Functions
 *
 * This module contains all database operations for managing job applications.
 * Includes CRUD operations, status updates, and bulk import functionality.
 * All operations are user-scoped for data isolation and security.
 */

/**
 * Retrieves all applications for the authenticated user
 *
 * @returns Array of applications ordered by creation date (newest first)
 */
export const getApplications = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    // Query applications belonging to the authenticated user
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc") // Most recent applications first
      .collect();
    return applications;
  },
});

/**
 * Creates a new job application for the authenticated user
 *
 * @param company - Company name
 * @param title - Job title/position
 * @param status - Initial application status (defaults to "interested")
 * @param history - Previous status history (optional)
 * @param notes - User notes about the application (optional)
 * @param link - Job posting URL (optional)
 * @param lastUpdated - Last modification timestamp (optional)
 * @returns The ID of the created application
 */
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

    // Create new application with provided data
    const application = await ctx.db.insert("applications", {
      userId: userId,
      company: args.company,
      title: args.title,
      status: args.status || "interested", // Default to "interested" if not specified
      history: args.history || undefined,
      notes: args.notes || undefined,
      link: args.link || undefined,
      lastUpdated: args.lastUpdated || undefined,
    });
    return application;
  },
});

/**
 * Bulk insert applications (internal mutation)
 *
 * Used for importing multiple applications at once, typically from data import.
 * This is an internal mutation that bypasses user authentication checks
 * and should only be called from other server-side functions.
 *
 * @param applications - Array of application objects to insert
 * @param userId - ID of the user to associate applications with
 */
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
    // Insert all applications in parallel for better performance
    await Promise.all(
      args.applications.map((application) =>
        ctx.db.insert("applications", {
          ...application,
          userId: args.userId,
          lastUpdated: Date.now(), // Set current timestamp
        }),
      ),
    );
  },
});

/**
 * Updates the status of an application and maintains status history
 *
 * When a status is updated, the previous status is added to the history array.
 * This maintains a chronological record of status changes for tracking progress.
 *
 * @param id - Application ID to update
 * @param status - New status to set
 * @returns Success message
 */
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

    // Verify the application exists and belongs to the user
    const application = await ctx.db.get(args.id);

    if (application?.userId !== userId) {
      throw new Error("Client is not authorized to update this application!");
    }

    // Prevent updating to the same status
    if (args.status === application.status) {
      throw new Error("Application status is already set to this status!");
    }

    // Update status and add previous status to history
    const updatedApplication = await ctx.db.patch(args.id, {
      status: args.status,
      history: [application.status, ...(application.history || [])], // Add current status to history
      lastUpdated: Date.now(),
    });

    return "success";
  },
  returns: v.string(),
});

/**
 * Gets opportunity IDs for applications that were created from opportunities
 *
 * This function is used to identify which applications were created from
 * job opportunities, allowing the system to track the conversion from
 * opportunity to application.
 *
 * @returns Array of opportunity IDs that have associated applications
 */
export const getSuggestedApplications = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    // Get all applications for the user
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Filter applications that have an associated opportunity
    const applicationsFromOpportunities = applications.filter(
      (application) => application.opportunityId != null,
    );

    // Extract the opportunity IDs
    const opportunityIds = applicationsFromOpportunities.map(
      (application) => application.opportunityId!,
    );

    return opportunityIds;
  },
});

/**
 * Deletes an application
 *
 * Permanently removes an application from the database.
 * Only the owner of the application can delete it.
 *
 * @param id - Application ID to delete
 * @returns Success message
 */
export const deleteApplication = mutation({
  args: {
    id: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    // Verify the application exists and belongs to the user
    const application = await ctx.db.get(args.id);

    if (application?.userId !== userId) {
      throw new Error("Client is not authorized to delete this application!");
    }

    // Delete the application
    await ctx.db.delete(args.id);
    return "success";
  },
  returns: v.string(),
});

/**
 * Changes the order of status history for an application
 *
 * This function is used when users manually reorder the status history
 * in the UI (e.g., drag and drop). It updates both the current status
 * and the history array to reflect the new order.
 *
 * @param id - Application ID to update
 * @param currentStatus - New current status (first in the reordered list)
 * @param history - New history array (remaining statuses in order)
 */
export const changeStatusOrder = mutation({
  args: {
    id: v.id("applications"),
    currentStatus: statusUnion,
    history: v.array(statusUnion),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    // Verify the application exists and belongs to the user
    const application = await ctx.db.get(args.id);
    if (application?.userId !== userId) {
      throw new Error("Client is not authorized to update this application!");
    }

    // Update the application with new status and history order
    await ctx.db.patch(args.id, {
      status: args.currentStatus,
      history: args.history,
    });
  },
});

/**
 * Updates application details
 *
 * Allows partial updates to application fields like company, title, notes, and link.
 * Only the owner of the application can update it.
 *
 * @param id - Application ID to update
 * @param company - New company name (optional)
 * @param title - New job title (optional)
 * @param notes - New notes (optional)
 * @param link - New job posting URL (optional)
 * @param lastUpdated - Last modification timestamp (optional)
 * @returns Success message
 */
export const updateApplication = mutation({
  args: {
    id: v.id("applications"),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    link: v.optional(v.string()),
    lastUpdated: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    // Verify the application exists and belongs to the user
    const application = await ctx.db.get(args.id);
    if (application?.userId !== userId) {
      throw new Error("Client is not authorized to update this application!");
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (args.company !== undefined) updateData.company = args.company;
    if (args.title !== undefined) updateData.title = args.title;
    if (args.notes !== undefined) updateData.notes = args.notes;
    if (args.link !== undefined) updateData.link = args.link;
    updateData.lastUpdated = args.lastUpdated || Date.now(); // Always update timestamp

    // Apply the updates
    await ctx.db.patch(args.id, updateData);
    return "success";
  },
});
