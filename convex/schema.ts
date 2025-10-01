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
    customerId: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("customerId", ["customerId"]),
  applications: defineTable({
    userId: v.id("users"),
    company: v.string(),
    title: v.string(),
    status: statusUnion,
    history: v.optional(v.array(statusUnion)),
    notes: v.optional(v.string()),
    link: v.optional(v.string()),
    dashboardLink: v.optional(v.string()),
    lastUpdated: v.optional(v.number()),
    suggestionId: v.optional(v.id("suggestions")),
  }).index("by_userId", ["userId"]),
  suggestions: defineTable({
    company: v.string(),
    title: v.string(),
    link: v.optional(v.string()),
    location: v.optional(v.string()),
    source: v.string(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_company", ["company"])
    .index("by_source_created", ["source", "createdAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["source"],
      staged: false,
    }),
});
