import { existsSync, readFileSync } from "fs";
import { join } from "path";

describe("PWA Icons", () => {
  const rootDir = process.cwd();
  const iconsDir = join(rootDir, "public", "icons");
  const manifestPath = join(rootDir, "public", "manifest.json");

  describe("Icon files existence", () => {
    it("should have icons directory in public folder", () => {
      expect(existsSync(iconsDir)).toBe(true);
    });

    it("should have 192x192 icon file", () => {
      const iconPath = join(iconsDir, "icon-192x192.png");
      expect(existsSync(iconPath)).toBe(true);
    });

    it("should have 512x512 icon file", () => {
      const iconPath = join(iconsDir, "icon-512x512.png");
      expect(existsSync(iconPath)).toBe(true);
    });
  });

  describe("Icon files are valid PNG", () => {
    const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    it("should have valid PNG signature for 192x192 icon", () => {
      const iconPath = join(iconsDir, "icon-192x192.png");
      const buffer = readFileSync(iconPath);
      const signature = buffer.subarray(0, 8);
      expect(signature.equals(PNG_SIGNATURE)).toBe(true);
    });

    it("should have valid PNG signature for 512x512 icon", () => {
      const iconPath = join(iconsDir, "icon-512x512.png");
      const buffer = readFileSync(iconPath);
      const signature = buffer.subarray(0, 8);
      expect(signature.equals(PNG_SIGNATURE)).toBe(true);
    });

    it("should have reasonable file size for 192x192 icon", () => {
      const iconPath = join(iconsDir, "icon-192x192.png");
      const buffer = readFileSync(iconPath);
      expect(buffer.length).toBeGreaterThan(100);
      expect(buffer.length).toBeLessThan(100000);
    });

    it("should have reasonable file size for 512x512 icon", () => {
      const iconPath = join(iconsDir, "icon-512x512.png");
      const buffer = readFileSync(iconPath);
      expect(buffer.length).toBeGreaterThan(100);
      expect(buffer.length).toBeLessThan(500000);
    });
  });

  describe("Manifest icon paths match actual files", () => {
    it("should have icon files matching manifest paths", () => {
      const manifestContent = readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent);
      const icons = manifest.icons as Array<{ src: string; sizes: string }>;

      icons.forEach((icon) => {
        const iconPath = join(rootDir, "public", icon.src);
        expect(existsSync(iconPath)).toBe(true);
      });
    });
  });
});
