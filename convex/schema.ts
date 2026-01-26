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
    isActive: v.optional(v.boolean()), // Marqué "en cours" dans un slot
  })
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_isCompleted", ["isCompleted"])
    .index("by_createdAt", ["createdAt"])
    .index("by_isActive", ["isActive"]),

  categories: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_createdAt", ["createdAt"]),

  // Table pour les slots de travail
  workSlots: defineTable({
    todoId: v.optional(v.id("todos")), // To-do assigné (optionnel)
    position: v.number(), // Position horizontale (0, 1, 2...)
    notes: v.string(), // Notes de travail
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_position", ["position"])
    .index("by_todoId", ["todoId"]),

  // Table pour archiver les notes à la complétion d'un to-do
  archivedNotes: defineTable({
    todoId: v.id("todos"),
    notes: v.string(),
    archivedAt: v.number(),
  })
    .index("by_todoId", ["todoId"]),
});
