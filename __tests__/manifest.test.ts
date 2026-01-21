import { existsSync, readFileSync } from "fs";
import { join } from "path";

describe("PWA Manifest", () => {
  const rootDir = process.cwd();
  const manifestPath = join(rootDir, "public", "manifest.json");

  describe("File existence", () => {
    it("should have manifest.json file in public directory", () => {
      expect(existsSync(manifestPath)).toBe(true);
    });

    it("should be valid JSON", () => {
      const content = readFileSync(manifestPath, "utf-8");
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  describe("Required fields", () => {
    let manifest: Record<string, unknown>;

    beforeAll(() => {
      const content = readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(content);
    });

    it("should have a name field", () => {
      expect(manifest.name).toBeDefined();
      expect(typeof manifest.name).toBe("string");
      expect((manifest.name as string).length).toBeGreaterThan(0);
    });

    it("should have name set to VoiceTodo", () => {
      expect(manifest.name).toBe("VoiceTodo");
    });

    it("should have a short_name field", () => {
      expect(manifest.short_name).toBeDefined();
      expect(typeof manifest.short_name).toBe("string");
    });

    it("should have a theme_color field", () => {
      expect(manifest.theme_color).toBeDefined();
      expect(typeof manifest.theme_color).toBe("string");
    });

    it("should have theme_color as a valid hex color", () => {
      expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("should have a background_color field", () => {
      expect(manifest.background_color).toBeDefined();
      expect(typeof manifest.background_color).toBe("string");
    });

    it("should have background_color as a valid hex color", () => {
      expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("should have an icons array", () => {
      expect(manifest.icons).toBeDefined();
      expect(Array.isArray(manifest.icons)).toBe(true);
    });
  });

  describe("Icons configuration", () => {
    let manifest: Record<string, unknown>;
    let icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>;

    beforeAll(() => {
      const content = readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(content);
      icons = manifest.icons as typeof icons;
    });

    it("should have at least 2 icons (192x192 and 512x512)", () => {
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });

    it("should have a 192x192 icon", () => {
      const icon192 = icons.find((icon) => icon.sizes === "192x192");
      expect(icon192).toBeDefined();
      expect(icon192?.src).toBeDefined();
      expect(icon192?.type).toBe("image/png");
    });

    it("should have a 512x512 icon", () => {
      const icon512 = icons.find((icon) => icon.sizes === "512x512");
      expect(icon512).toBeDefined();
      expect(icon512?.src).toBeDefined();
      expect(icon512?.type).toBe("image/png");
    });

    it("should have icons with purpose field for maskable support", () => {
      icons.forEach((icon) => {
        expect(icon.purpose).toBeDefined();
        expect(icon.purpose).toContain("maskable");
      });
    });
  });

  describe("PWA display configuration", () => {
    let manifest: Record<string, unknown>;

    beforeAll(() => {
      const content = readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(content);
    });

    it("should have display set to standalone", () => {
      expect(manifest.display).toBe("standalone");
    });

    it("should have start_url defined", () => {
      expect(manifest.start_url).toBeDefined();
      expect(manifest.start_url).toBe("/");
    });
  });
});
