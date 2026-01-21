import { existsSync, readFileSync } from "fs";
import { join } from "path";

describe("iOS PWA Configuration", () => {
  const rootDir = process.cwd();

  describe("Apple Touch Icon", () => {
    it("should have apple-touch-icon in public/icons directory", () => {
      const iconPath = join(rootDir, "public", "icons", "icon-192x192.png");
      expect(existsSync(iconPath)).toBe(true);
    });

    it("should have 512x512 icon for high resolution displays", () => {
      const iconPath = join(rootDir, "public", "icons", "icon-512x512.png");
      expect(existsSync(iconPath)).toBe(true);
    });
  });

  describe("iOS Splash Screens", () => {
    const splashScreens = [
      { name: "apple-splash-2048-2732.png", device: "iPad Pro 12.9" },
      { name: "apple-splash-1170-2532.png", device: "iPhone 12/13/14" },
      { name: "apple-splash-1179-2556.png", device: "iPhone 14 Pro" },
      { name: "apple-splash-1284-2778.png", device: "iPhone 12/13/14 Pro Max" },
      { name: "apple-splash-1290-2796.png", device: "iPhone 14 Pro Max" },
    ];

    splashScreens.forEach(({ name, device }) => {
      it(`should have splash screen for ${device}`, () => {
        const splashPath = join(rootDir, "public", "icons", name);
        expect(existsSync(splashPath)).toBe(true);
      });
    });
  });

  describe("Layout metadata for iOS", () => {
    let layoutContent: string;

    beforeAll(() => {
      const layoutPath = join(rootDir, "app", "layout.tsx");
      layoutContent = readFileSync(layoutPath, "utf-8");
    });

    it("should have appleWebApp capable meta tag", () => {
      expect(layoutContent).toContain("appleWebApp");
      expect(layoutContent).toContain("capable: true");
    });

    it("should have apple status bar style configured", () => {
      expect(layoutContent).toContain("statusBarStyle");
    });

    it("should have apple web app title", () => {
      expect(layoutContent).toContain('title: "VoiceTodo"');
    });

    it("should have startup images configured for iOS", () => {
      expect(layoutContent).toContain("startupImage");
    });

    it("should have apple-touch-icon link in head", () => {
      expect(layoutContent).toContain("apple-touch-icon");
    });
  });

  describe("Manifest configuration for iOS compatibility", () => {
    let manifest: Record<string, unknown>;

    beforeAll(() => {
      const manifestPath = join(rootDir, "public", "manifest.json");
      const content = readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(content);
    });

    it("should have display mode set to standalone for fullscreen experience", () => {
      expect(manifest.display).toBe("standalone");
    });

    it("should have scope defined for navigation boundaries", () => {
      expect(manifest.scope).toBe("/");
    });

    it("should have orientation set to portrait", () => {
      expect(manifest.orientation).toBe("portrait");
    });

    it("should have background_color for splash screen", () => {
      expect(manifest.background_color).toBeDefined();
      expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("should have theme_color for address bar", () => {
      expect(manifest.theme_color).toBeDefined();
      expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe("Viewport configuration", () => {
    let layoutContent: string;

    beforeAll(() => {
      const layoutPath = join(rootDir, "app", "layout.tsx");
      layoutContent = readFileSync(layoutPath, "utf-8");
    });

    it("should disable user scaling to prevent zoom issues on iOS", () => {
      expect(layoutContent).toContain("userScalable: false");
    });

    it("should set initial scale to 1", () => {
      expect(layoutContent).toContain("initialScale: 1");
    });

    it("should have device-width viewport", () => {
      expect(layoutContent).toContain('width: "device-width"');
    });
  });
});
