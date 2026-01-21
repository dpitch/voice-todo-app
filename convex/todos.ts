import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todos").withIndex("by_createdAt").order("desc").collect();
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    category: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const todoId = await ctx.db.insert("todos", {
      content: args.content,
      category: args.category,
      priority: args.priority,
      isCompleted: args.isCompleted,
      completedAt: args.completedAt,
      createdAt: args.createdAt,
    });
    return todoId;
  },
});
