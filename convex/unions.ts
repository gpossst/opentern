import { v } from "convex/values";

export const statusUnion = v.union(
  v.literal("interested"),
  v.literal("applied"),
  v.literal("assessment"),
  v.literal("interviewed"),
  v.literal("offered"),
  v.literal("rejected"),
  v.literal("archived"),
);
