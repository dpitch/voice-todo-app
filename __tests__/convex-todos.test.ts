import { create, list, listByCategory, toggleComplete, updateCategory, remove } from "../convex/todos";

describe("Convex Todos Query", () => {
  describe("list query", () => {
    it("should be defined", () => {
      expect(list).toBeDefined();
    });

    it("should be a query function", () => {
      expect(list).toHaveProperty("isQuery", true);
    });

    it("should not require any arguments", () => {
      expect(list.args).toEqual({});
    });

    it("should have a handler function", () => {
      expect(list.handler).toBeDefined();
      expect(typeof list.handler).toBe("function");
    });
  });

  describe("listByCategory query", () => {
    it("should be defined", () => {
      expect(listByCategory).toBeDefined();
    });

    it("should be a query function", () => {
      expect(listByCategory).toHaveProperty("isQuery", true);
    });

    it("should require a category argument", () => {
      expect(listByCategory.args).toHaveProperty("category");
    });

    it("should have a handler function", () => {
      expect(listByCategory.handler).toBeDefined();
      expect(typeof listByCategory.handler).toBe("function");
    });
  });

  describe("create mutation", () => {
    it("should be defined", () => {
      expect(create).toBeDefined();
    });

    it("should be a mutation function", () => {
      expect(create).toHaveProperty("isMutation", true);
    });

    it("should require content argument", () => {
      expect(create.args).toHaveProperty("content");
    });

    it("should require category argument", () => {
      expect(create.args).toHaveProperty("category");
    });

    it("should require priority argument", () => {
      expect(create.args).toHaveProperty("priority");
    });

    it("should require isCompleted argument", () => {
      expect(create.args).toHaveProperty("isCompleted");
    });

    it("should have optional completedAt argument", () => {
      expect(create.args).toHaveProperty("completedAt");
    });

    it("should require createdAt argument", () => {
      expect(create.args).toHaveProperty("createdAt");
    });

    it("should have a handler function", () => {
      expect(create.handler).toBeDefined();
      expect(typeof create.handler).toBe("function");
    });
  });

  describe("toggleComplete mutation", () => {
    it("should be defined", () => {
      expect(toggleComplete).toBeDefined();
    });

    it("should be a mutation function", () => {
      expect(toggleComplete).toHaveProperty("isMutation", true);
    });

    it("should require id argument", () => {
      expect(toggleComplete.args).toHaveProperty("id");
    });

    it("should have a handler function", () => {
      expect(toggleComplete.handler).toBeDefined();
      expect(typeof toggleComplete.handler).toBe("function");
    });
  });

  describe("updateCategory mutation", () => {
    it("should be defined", () => {
      expect(updateCategory).toBeDefined();
    });

    it("should be a mutation function", () => {
      expect(updateCategory).toHaveProperty("isMutation", true);
    });

    it("should require id argument", () => {
      expect(updateCategory.args).toHaveProperty("id");
    });

    it("should require category argument", () => {
      expect(updateCategory.args).toHaveProperty("category");
    });

    it("should have a handler function", () => {
      expect(updateCategory.handler).toBeDefined();
      expect(typeof updateCategory.handler).toBe("function");
    });
  });

  describe("remove mutation", () => {
    it("should be defined", () => {
      expect(remove).toBeDefined();
    });

    it("should be a mutation function", () => {
      expect(remove).toHaveProperty("isMutation", true);
    });

    it("should require id argument", () => {
      expect(remove.args).toHaveProperty("id");
    });

    it("should have a handler function", () => {
      expect(remove.handler).toBeDefined();
      expect(typeof remove.handler).toBe("function");
    });
  });
});
