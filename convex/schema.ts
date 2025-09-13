import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { statusUnion } from "./unions";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  /**
   * Users.
   */
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    sub: v.optional(v.union(v.literal("basic"), v.literal("pro"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  applications: defineTable({
    userId: v.id("users"),
    company: v.string(),
    title: v.string(),
    status: statusUnion,
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
  }).index("by_userId", ["userId"]),
});
