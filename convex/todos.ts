import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todos").withIndex("by_createdAt").order("desc").collect();
  },
});

// Categories queries and mutations
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").withIndex("by_createdAt").order("asc").collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if category already exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (existing) {
      return existing._id;
    }

    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      color: args.color,
      createdAt: Date.now(),
    });
    return categoryId;
  },
});

export const deleteCategory = mutation({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }
    
    // Move all todos in this category to "General"
    const todosInCategory = await ctx.db
      .query("todos")
      .withIndex("by_category", (q) => q.eq("category", category.name))
      .collect();
    
    for (const todo of todosInCategory) {
      await ctx.db.patch(todo._id, { category: "General" });
    }

    await ctx.db.delete(args.id);
    return args.id;
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
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const todoId = await ctx.db.insert("todos", {
      content: args.content,
      category: args.category,
      priority: args.priority,
      isCompleted: args.isCompleted,
      completedAt: args.completedAt,
      createdAt: args.createdAt,
      imageStorageIds: args.imageStorageIds,
    });
    return todoId;
  },
});

export const toggleComplete = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    const isCompleted = !todo.isCompleted;
    const completedAt = isCompleted ? Date.now() : undefined;

    await ctx.db.patch(args.id, {
      isCompleted,
      completedAt,
    });

    return { ...todo, isCompleted, completedAt };
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("todos"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    await ctx.db.patch(args.id, {
      category: args.category,
    });

    return { ...todo, category: args.category };
  },
});

export const remove = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
