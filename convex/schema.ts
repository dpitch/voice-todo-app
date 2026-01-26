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
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    isProcessing: v.optional(v.boolean()),
  })
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_isCompleted", ["isCompleted"])
    .index("by_createdAt", ["createdAt"]),

  categories: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_createdAt", ["createdAt"]),
});
