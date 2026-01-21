import fs from "fs";
import path from "path";

describe("Project dependencies", () => {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  let packageJson: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  beforeAll(() => {
    const content = fs.readFileSync(packageJsonPath, "utf-8");
    packageJson = JSON.parse(content);
  });

  describe("Convex dependency", () => {
    it("convex is listed in dependencies", () => {
      expect(packageJson.dependencies).toHaveProperty("convex");
    });

    it("convex version is specified", () => {
      expect(packageJson.dependencies.convex).toBeDefined();
      expect(typeof packageJson.dependencies.convex).toBe("string");
    });

    it("convex can be imported", async () => {
      const convex = await import("convex/react");
      expect(convex).toBeDefined();
      expect(convex.useQuery).toBeDefined();
      expect(convex.useMutation).toBeDefined();
      expect(convex.ConvexProvider).toBeDefined();
    });
  });

  describe("@dnd-kit/core dependency", () => {
    it("@dnd-kit/core is listed in dependencies", () => {
      expect(packageJson.dependencies).toHaveProperty("@dnd-kit/core");
    });

    it("@dnd-kit/core version is specified", () => {
      expect(packageJson.dependencies["@dnd-kit/core"]).toBeDefined();
      expect(typeof packageJson.dependencies["@dnd-kit/core"]).toBe("string");
    });

    it("@dnd-kit/core can be imported", async () => {
      const dndCore = await import("@dnd-kit/core");
      expect(dndCore).toBeDefined();
      expect(dndCore.DndContext).toBeDefined();
      expect(dndCore.useDraggable).toBeDefined();
      expect(dndCore.useDroppable).toBeDefined();
    });
  });

  describe("@dnd-kit/sortable dependency", () => {
    it("@dnd-kit/sortable is listed in dependencies", () => {
      expect(packageJson.dependencies).toHaveProperty("@dnd-kit/sortable");
    });

    it("@dnd-kit/sortable version is specified", () => {
      expect(packageJson.dependencies["@dnd-kit/sortable"]).toBeDefined();
      expect(typeof packageJson.dependencies["@dnd-kit/sortable"]).toBe("string");
    });

    it("@dnd-kit/sortable can be imported", async () => {
      const dndSortable = await import("@dnd-kit/sortable");
      expect(dndSortable).toBeDefined();
      expect(dndSortable.SortableContext).toBeDefined();
      expect(dndSortable.useSortable).toBeDefined();
      expect(dndSortable.arrayMove).toBeDefined();
    });
  });

  describe("Node modules installation", () => {
    const nodeModulesPath = path.join(process.cwd(), "node_modules");

    it("convex package directory exists", () => {
      const convexPath = path.join(nodeModulesPath, "convex");
      expect(fs.existsSync(convexPath)).toBe(true);
    });

    it("@dnd-kit/core package directory exists", () => {
      const dndCorePath = path.join(nodeModulesPath, "@dnd-kit", "core");
      expect(fs.existsSync(dndCorePath)).toBe(true);
    });

    it("@dnd-kit/sortable package directory exists", () => {
      const dndSortablePath = path.join(nodeModulesPath, "@dnd-kit", "sortable");
      expect(fs.existsSync(dndSortablePath)).toBe(true);
    });
  });
});
