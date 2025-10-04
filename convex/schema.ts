import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { statusUnion } from "./unions";

/**
 * Database Schema Definition
 *
 * This schema defines the structure of all tables in the Convex database.
 * The schema is required for Convex Auth to work properly and provides
 * precise TypeScript types for better development experience.
 *
 * Tables:
 * - authTables: Authentication-related tables (users, sessions, etc.)
 * - users: Extended user profile information
 * - applications: Job application tracking data
 * - opportunities: Job opportunities from various sources
 */
export default defineSchema({
  // Include authentication tables from Convex Auth
  ...authTables,

  /**
   * Users Table
   *
   * Extended user profile information beyond what's provided by Convex Auth.
   * Stores user preferences, subscription status, and payment information.
   */
  users: defineTable({
    name: v.optional(v.string()), // User's display name
    image: v.optional(v.string()), // Profile image URL
    email: v.optional(v.string()), // Email address
    emailVerificationTime: v.optional(v.number()), // When email was verified
    phone: v.optional(v.string()), // Phone number
    phoneVerificationTime: v.optional(v.number()), // When phone was verified
    isAnonymous: v.optional(v.boolean()), // Whether user is anonymous
    sub: v.optional(v.union(v.literal("basic"), v.literal("pro"))), // Subscription tier
    customerId: v.optional(v.string()), // Payment provider customer ID
  })
    .index("email", ["email"]) // Index for email lookups
    .index("phone", ["phone"]) // Index for phone lookups
    .index("customerId", ["customerId"]), // Index for payment lookups

  /**
   * Applications Table
   *
   * Stores job application data including company, position, status,
   * and tracking history. Each application belongs to a user.
   */
  applications: defineTable({
    userId: v.id("users"), // Owner of the application
    company: v.string(), // Company name
    title: v.string(), // Job title/position
    status: statusUnion, // Current application status
    history: v.optional(v.array(statusUnion)), // Previous statuses (chronological)
    notes: v.optional(v.string()), // User notes about the application
    link: v.optional(v.string()), // Job posting URL
    dashboardLink: v.optional(v.string()), // Application dashboard URL
    lastUpdated: v.optional(v.number()), // Last modification timestamp
    opportunityId: v.optional(v.id("opportunities")), // Link to source opportunity
  }).index("by_userId", ["userId"]), // Index for user's applications

  /**
   * Opportunities Table
   *
   * Stores job opportunities scraped from various sources.
   * Used to suggest applications to users and track job market data.
   */
  opportunities: defineTable({
    company: v.string(), // Company name
    title: v.string(), // Job title
    link: v.optional(v.string()), // Job posting URL
    location: v.optional(v.string()), // Job location
    source: v.string(), // Source of the opportunity (e.g., "linkedin", "indeed")
    createdAt: v.number(), // When opportunity was discovered
  })
    .index("by_createdAt", ["createdAt"]) // Index for chronological sorting
    .index("by_company", ["company"]) // Index for company-based queries
    .index("by_source_created", ["source", "createdAt"]) // Composite index for source + time
    .searchIndex("search_title", {
      // Full-text search on job titles
      searchField: "title",
      filterFields: ["source"],
      staged: false,
    }),
});
