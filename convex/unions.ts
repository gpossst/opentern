import { v } from "convex/values";

/**
 * Union Type Definitions
 *
 * This module defines shared union types used throughout the application.
 * These types ensure consistency across the codebase and provide type safety
 * for status values and other enumerated fields.
 */

/**
 * Application Status Union Type
 *
 * Defines all possible statuses for job applications. These statuses represent
 * the different stages of the application process from initial interest to final outcome.
 *
 * Status Flow:
 * - interested: User is interested in the position
 * - applied: Application has been submitted
 * - assessment: User is taking tests/assessments
 * - interviewed: User has had interviews
 * - offered: User received a job offer
 * - rejected: Application was rejected
 * - archived: Application is no longer active
 */
export const statusUnion = v.union(
  v.literal("interested"),
  v.literal("applied"),
  v.literal("assessment"),
  v.literal("interviewed"),
  v.literal("offered"),
  v.literal("rejected"),
  v.literal("archived"),
);
