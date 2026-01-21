import fs from "fs";
import path from "path";

describe("shadcn/ui configuration", () => {
  const componentsJsonPath = path.join(process.cwd(), "components.json");

  it("components.json exists", () => {
    expect(fs.existsSync(componentsJsonPath)).toBe(true);
  });

  describe("components.json configuration", () => {
    let config: {
      style: string;
      rsc: boolean;
      tsx: boolean;
      tailwind: {
        baseColor: string;
        cssVariables: boolean;
        css: string;
      };
      aliases: {
        components: string;
        utils: string;
        ui: string;
      };
    };

    beforeAll(() => {
      const content = fs.readFileSync(componentsJsonPath, "utf-8");
      config = JSON.parse(content);
    });

    it("uses new-york style", () => {
      expect(config.style).toBe("new-york");
    });

    it("uses neutral base color", () => {
      expect(config.tailwind.baseColor).toBe("neutral");
    });

    it("has CSS variables enabled", () => {
      expect(config.tailwind.cssVariables).toBe(true);
    });

    it("has RSC (React Server Components) enabled", () => {
      expect(config.rsc).toBe(true);
    });

    it("uses TypeScript (tsx)", () => {
      expect(config.tsx).toBe(true);
    });

    it("has correct alias paths configured", () => {
      expect(config.aliases.components).toBe("@/components");
      expect(config.aliases.utils).toBe("@/lib/utils");
      expect(config.aliases.ui).toBe("@/components/ui");
    });

    it("points to correct CSS file", () => {
      expect(config.tailwind.css).toBe("app/globals.css");
    });
  });

  describe("utils.ts file", () => {
    const utilsPath = path.join(process.cwd(), "lib", "utils.ts");

    it("utils.ts exists", () => {
      expect(fs.existsSync(utilsPath)).toBe(true);
    });

    it("exports cn function", () => {
      const content = fs.readFileSync(utilsPath, "utf-8");
      expect(content).toContain("export function cn");
    });

    it("imports clsx", () => {
      const content = fs.readFileSync(utilsPath, "utf-8");
      expect(content).toContain('from "clsx"');
    });

    it("imports tailwind-merge", () => {
      const content = fs.readFileSync(utilsPath, "utf-8");
      expect(content).toContain('from "tailwind-merge"');
    });
  });

  describe("globals.css CSS variables", () => {
    const globalsCssPath = path.join(process.cwd(), "app", "globals.css");

    it("globals.css exists", () => {
      expect(fs.existsSync(globalsCssPath)).toBe(true);
    });

    it("contains CSS variables in :root", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain(":root {");
      expect(content).toContain("--background:");
      expect(content).toContain("--foreground:");
      expect(content).toContain("--primary:");
      expect(content).toContain("--secondary:");
    });

    it("contains dark mode variables", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain(".dark {");
    });

    it("contains radius variable for rounded corners", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("--radius:");
    });
  });
});
