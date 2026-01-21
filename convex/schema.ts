import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    content: v.string(),
    category: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_isCompleted", ["isCompleted"])
    .index("by_createdAt", ["createdAt"]),
});
