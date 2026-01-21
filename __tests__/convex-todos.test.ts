import { list } from "../convex/todos";

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
});
