import { existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * PWA Installation Tests for Mac (Chrome and Safari)
 *
 * These tests verify that all the requirements for PWA installation
 * are met for both Chrome and Safari on macOS.
 *
 * Chrome PWA requirements:
 * - Valid manifest.json with name, icons, start_url, display
 * - Service worker registered
 * - Served over HTTPS (in production)
 * - Icons: 192x192 and 512x512
 *
 * Safari PWA requirements (iOS/macOS):
 * - apple-mobile-web-app-capable meta tag
 * - apple-mobile-web-app-status-bar-style meta tag
 * - apple-touch-icon link
 * - manifest.json linked
 */

describe("PWA Installation - Mac Chrome & Safari", () => {
  const rootDir = process.cwd();
  const manifestPath = join(rootDir, "public", "manifest.json");
  const layoutPath = join(rootDir, "app", "layout.tsx");
  const swPath = join(rootDir, "app", "sw.ts");

  describe("Chrome PWA Installation Requirements", () => {
    describe("Web App Manifest", () => {
      let manifest: Record<string, unknown>;

      beforeAll(() => {
        const content = readFileSync(manifestPath, "utf-8");
        manifest = JSON.parse(content);
      });

      it("should have manifest.json file", () => {
        expect(existsSync(manifestPath)).toBe(true);
      });

      it("should have name field for Chrome installation prompt", () => {
        expect(manifest.name).toBeDefined();
        expect(typeof manifest.name).toBe("string");
        expect((manifest.name as string).length).toBeGreaterThan(0);
      });

      it("should have short_name field (max 12 chars recommended)", () => {
        expect(manifest.short_name).toBeDefined();
        expect(typeof manifest.short_name).toBe("string");
        // Chrome recommends short_name to be 12 characters or less
        expect((manifest.short_name as string).length).toBeLessThanOrEqual(15);
      });

      it("should have start_url for app launch", () => {
        expect(manifest.start_url).toBeDefined();
        expect(manifest.start_url).toBe("/");
      });

      it("should have display mode set to standalone or fullscreen", () => {
        expect(manifest.display).toBeDefined();
        expect(["standalone", "fullscreen"]).toContain(manifest.display);
      });

      it("should have 192x192 icon for Chrome (required)", () => {
        const icons = manifest.icons as Array<{ src: string; sizes: string }>;
        const icon192 = icons.find((icon) => icon.sizes === "192x192");
        expect(icon192).toBeDefined();
      });

      it("should have 512x512 icon for Chrome (required for splash screen)", () => {
        const icons = manifest.icons as Array<{ src: string; sizes: string }>;
        const icon512 = icons.find((icon) => icon.sizes === "512x512");
        expect(icon512).toBeDefined();
      });

      it("should have maskable icons for adaptive icon support", () => {
        const icons = manifest.icons as Array<{ src: string; sizes: string; purpose?: string }>;
        const maskableIcons = icons.filter((icon) => icon.purpose?.includes("maskable"));
        expect(maskableIcons.length).toBeGreaterThan(0);
      });

      it("should have background_color for splash screen", () => {
        expect(manifest.background_color).toBeDefined();
        expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it("should have theme_color for browser UI theming", () => {
        expect(manifest.theme_color).toBeDefined();
        expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    describe("Service Worker", () => {
      it("should have service worker source file", () => {
        expect(existsSync(swPath)).toBe(true);
      });

      it("should configure precaching for offline support", () => {
        const content = readFileSync(swPath, "utf-8");
        expect(content).toContain("precacheEntries");
      });

      it("should enable skipWaiting for immediate activation", () => {
        const content = readFileSync(swPath, "utf-8");
        expect(content).toContain("skipWaiting: true");
      });

      it("should enable clientsClaim for immediate control", () => {
        const content = readFileSync(swPath, "utf-8");
        expect(content).toContain("clientsClaim: true");
      });
    });
  });

  describe("Safari PWA Installation Requirements (macOS/iOS)", () => {
    let layoutContent: string;

    beforeAll(() => {
      layoutContent = readFileSync(layoutPath, "utf-8");
    });

    describe("Apple Web App Meta Tags", () => {
      it("should have apple-mobile-web-app-capable configuration", () => {
        // Next.js metadata API uses appleWebApp.capable
        expect(layoutContent).toContain("appleWebApp");
        expect(layoutContent).toContain("capable: true");
      });

      it("should have apple-mobile-web-app-status-bar-style configuration", () => {
        // Next.js metadata API uses appleWebApp.statusBarStyle
        expect(layoutContent).toContain("statusBarStyle");
      });

      it("should have apple-mobile-web-app-title configuration", () => {
        // Next.js metadata API uses appleWebApp.title
        expect(layoutContent).toContain('title: "VoiceTodo"');
      });
    });

    describe("Apple Touch Icon", () => {
      it("should have apple-touch-icon link in layout", () => {
        expect(layoutContent).toContain('rel="apple-touch-icon"');
      });

      it("should reference a valid icon path", () => {
        expect(layoutContent).toContain('href="/icons/icon-192x192.png"');
      });

      it("should have the apple-touch-icon file exist", () => {
        const iconPath = join(rootDir, "public", "icons", "icon-192x192.png");
        expect(existsSync(iconPath)).toBe(true);
      });
    });

    describe("Manifest Link", () => {
      it("should have manifest link in metadata", () => {
        expect(layoutContent).toContain('manifest: "/manifest.json"');
      });
    });

    describe("Viewport Configuration", () => {
      it("should have viewport configuration for proper display", () => {
        expect(layoutContent).toContain("viewport: Viewport");
      });

      it("should set device-width", () => {
        expect(layoutContent).toContain('width: "device-width"');
      });

      it("should have theme color for Safari toolbar", () => {
        expect(layoutContent).toContain('themeColor: "#8b5cf6"');
      });

      it("should control user scaling for app-like feel", () => {
        expect(layoutContent).toContain("userScalable: false");
      });
    });
  });

  describe("Cross-Browser Compatibility", () => {
    let manifest: Record<string, unknown>;
    let layoutContent: string;

    beforeAll(() => {
      const manifestContent = readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(manifestContent);
      layoutContent = readFileSync(layoutPath, "utf-8");
    });

    it("should have consistent app name across manifest and layout", () => {
      expect(manifest.name).toBe("VoiceTodo");
      expect(layoutContent).toContain('title: "VoiceTodo"');
    });

    it("should have consistent theme color across manifest and layout", () => {
      const manifestThemeColor = manifest.theme_color;
      expect(layoutContent).toContain(`themeColor: "${manifestThemeColor}"`);
    });

    it("should have consistent description across manifest and layout", () => {
      const description = manifest.description as string;
      expect(layoutContent).toContain(description);
    });

    it("should have icons with both any and maskable purpose for maximum compatibility", () => {
      const icons = manifest.icons as Array<{ src: string; purpose?: string }>;
      const hasAnyMaskable = icons.some((icon) => icon.purpose?.includes("any") && icon.purpose?.includes("maskable"));
      expect(hasAnyMaskable).toBe(true);
    });
  });

  describe("Offline Support Validation", () => {
    let swContent: string;

    beforeAll(() => {
      swContent = readFileSync(swPath, "utf-8");
    });

    it("should have NetworkFirst strategy for navigation requests", () => {
      expect(swContent).toContain("NetworkFirst");
      expect(swContent).toContain('request.mode === "navigate"');
    });

    it("should have CacheFirst strategy for static assets", () => {
      expect(swContent).toContain("CacheFirst");
    });

    it("should cache PWA icons", () => {
      expect(swContent).toContain("pwa-icons");
      // Check that icons caching matcher exists (regex pattern in source)
      expect(swContent).toContain("icons");
      expect(swContent).toContain("png");
    });

    it("should cache manifest.json", () => {
      expect(swContent).toContain("manifest-cache");
      expect(swContent).toContain("/manifest\\.json");
    });

    it("should have navigation preload enabled for faster page loads", () => {
      expect(swContent).toContain("navigationPreload: true");
    });

    it("should handle Convex API separately (network-only)", () => {
      expect(swContent).toContain("NetworkOnly");
      // Check for the regex pattern that matches Convex API
      expect(swContent).toMatch(/\\\.convex\\\.cloud/);
    });
  });

  describe("PWA Best Practices for Mac", () => {
    let manifest: Record<string, unknown>;

    beforeAll(() => {
      const content = readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(content);
    });

    it("should have display mode that works on Mac (standalone)", () => {
      // standalone is the recommended mode for Mac PWAs
      expect(manifest.display).toBe("standalone");
    });

    it("should have dark background color for Mac Dark Mode compatibility", () => {
      // Dark background works well with macOS Dark Mode
      const bgColor = manifest.background_color as string;
      // Check if it's a dark color (low luminance)
      const hex = bgColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      // Luminance < 0.5 indicates a dark color
      expect(luminance).toBeLessThan(0.5);
    });

    it("should have icons that are PNG format for best compatibility", () => {
      const icons = manifest.icons as Array<{ type: string }>;
      icons.forEach((icon) => {
        expect(icon.type).toBe("image/png");
      });
    });

    it("should start at root URL for clean app experience", () => {
      expect(manifest.start_url).toBe("/");
    });
  });
});
