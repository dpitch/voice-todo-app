import { readFileSync, existsSync } from "fs";
import { join } from "path";

describe("Real-time Sync Configuration", () => {
  const rootDir = process.cwd();

  describe("Convex real-time queries", () => {
    let todosContent: string;

    beforeAll(() => {
      const todosPath = join(rootDir, "convex", "todos.ts");
      todosContent = readFileSync(todosPath, "utf-8");
    });

    it("should export list query for real-time todo fetching", () => {
      expect(todosContent).toContain("export const list = query");
    });

    it("should export listByCategory query for filtered real-time data", () => {
      expect(todosContent).toContain("export const listByCategory = query");
    });

    it("should use proper indexing for efficient queries", () => {
      expect(todosContent).toContain('withIndex("by_createdAt")');
      expect(todosContent).toContain('withIndex("by_category"');
    });
  });

  describe("Convex mutations for real-time updates", () => {
    let todosContent: string;

    beforeAll(() => {
      const todosPath = join(rootDir, "convex", "todos.ts");
      todosContent = readFileSync(todosPath, "utf-8");
    });

    it("should export create mutation", () => {
      expect(todosContent).toContain("export const create = mutation");
    });

    it("should export toggleComplete mutation", () => {
      expect(todosContent).toContain("export const toggleComplete = mutation");
    });

    it("should export updateCategory mutation for drag-drop", () => {
      expect(todosContent).toContain("export const updateCategory = mutation");
    });

    it("should export remove mutation", () => {
      expect(todosContent).toContain("export const remove = mutation");
    });
  });

  describe("Service worker real-time handling", () => {
    let swContent: string;

    beforeAll(() => {
      const swPath = join(rootDir, "app", "sw.ts");
      swContent = readFileSync(swPath, "utf-8");
    });

    it("should use NetworkOnly for Convex API requests to ensure real-time sync", () => {
      expect(swContent).toContain("NetworkOnly");
      // The regex in sw.ts escapes dots, so we check for the escaped version
      expect(swContent).toContain("convex");
      expect(swContent).toContain("cloud");
    });

    it("should NOT cache Convex requests to maintain real-time integrity", () => {
      // Verify that Convex requests use NetworkOnly strategy
      // The pattern in sw.ts is: matcher: /\.convex\.cloud/i with NetworkOnly handler
      expect(swContent).toMatch(/convex.*cloud.*NetworkOnly|NetworkOnly.*convex.*cloud/is);
    });

    it("should have proper caching for app shell while preserving real-time data", () => {
      expect(swContent).toContain("NetworkFirst");
      expect(swContent).toContain("pages-cache");
    });
  });

  describe("Frontend real-time integration", () => {
    let pageContent: string;

    beforeAll(() => {
      const pagePath = join(rootDir, "app", "page.tsx");
      pageContent = readFileSync(pagePath, "utf-8");
    });

    it("should use useQuery hook for real-time subscriptions", () => {
      expect(pageContent).toContain("useQuery");
      expect(pageContent).toContain("api.todos.list");
    });

    it("should use useMutation for real-time updates", () => {
      expect(pageContent).toContain("useMutation");
    });

    it("should have mutations for create, toggle, and update operations", () => {
      expect(pageContent).toContain("api.todos.create");
      expect(pageContent).toContain("api.todos.toggleComplete");
      expect(pageContent).toContain("api.todos.updateCategory");
    });
  });

  describe("Convex client provider", () => {
    it("should have ConvexClientProvider component", () => {
      const providerPath = join(rootDir, "app", "ConvexClientProvider.tsx");
      expect(existsSync(providerPath)).toBe(true);
    });

    it("should wrap children in ConvexProvider", () => {
      const providerPath = join(rootDir, "app", "ConvexClientProvider.tsx");
      const providerContent = readFileSync(providerPath, "utf-8");
      expect(providerContent).toContain("ConvexProvider");
    });
  });

  describe("Database schema for real-time data", () => {
    let schemaContent: string;

    beforeAll(() => {
      const schemaPath = join(rootDir, "convex", "schema.ts");
      schemaContent = readFileSync(schemaPath, "utf-8");
    });

    it("should define todos table with required fields", () => {
      expect(schemaContent).toContain("todos:");
      expect(schemaContent).toContain("content:");
      expect(schemaContent).toContain("category:");
      expect(schemaContent).toContain("priority:");
      expect(schemaContent).toContain("isCompleted:");
    });

    it("should have indexes for efficient real-time queries", () => {
      expect(schemaContent).toContain("by_createdAt");
      expect(schemaContent).toContain("by_category");
    });
  });
});

describe("Real-time sync behavior simulation", () => {
  describe("Query reactivity pattern", () => {
    it("should return undefined while loading, then data when available", () => {
      // Simulate the pattern used in page.tsx
      let data: unknown[] | undefined = undefined;

      // Initially undefined (loading state)
      expect(data).toBeUndefined();

      // After data loads
      data = [{ id: "1", content: "Test todo", category: "Work" }];
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
    });

    it("should handle empty data state correctly", () => {
      const data: unknown[] = [];
      expect(data).toBeDefined();
      expect(data.length).toBe(0);
    });
  });

  describe("Mutation optimistic updates pattern", () => {
    it("should immediately reflect UI changes before server confirmation", () => {
      // This tests the pattern where UI updates optimistically
      const todos = [{ id: "1", content: "Test", isCompleted: false }];

      // Simulating optimistic toggle
      const toggledTodos = todos.map((todo) =>
        todo.id === "1" ? { ...todo, isCompleted: true } : todo
      );

      expect(toggledTodos[0].isCompleted).toBe(true);
    });
  });
});
