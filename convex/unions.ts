import { v } from "convex/values";

export const statusUnion = v.union(
  v.literal("interested"),
  v.literal("submitted"),
  v.literal("assessment"),
  v.literal("interviewed"),
  v.literal("offered"),
  v.literal("rejected"),
);
