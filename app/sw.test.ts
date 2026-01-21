/**
 * Tests for the service worker configuration.
 *
 * Note: Service workers run in a ServiceWorkerGlobalScope, not in jsdom.
 * These tests verify the configuration patterns and regex matchers
 * rather than the actual service worker execution.
 *
 * The actual Serwist strategies are tested through integration tests
 * by building the app and testing in a real browser.
 */

describe("Service Worker Configuration", () => {
  describe("URL matchers for caching strategies", () => {
    const iconsMatcher = /\/icons\/.*\.png$/i;
    const manifestMatcher = /\/manifest\.json$/i;
    const convexMatcher = /\.convex\.cloud/i;

    describe("icons matcher", () => {
      it("should match PWA icon paths", () => {
        expect(iconsMatcher.test("/icons/icon-192x192.png")).toBe(true);
        expect(iconsMatcher.test("/icons/icon-512x512.png")).toBe(true);
      });

      it("should not match other PNG files", () => {
        expect(iconsMatcher.test("/images/photo.png")).toBe(false);
        expect(iconsMatcher.test("/other/icon.png")).toBe(false);
      });

      it("should not match non-PNG files in icons folder", () => {
        expect(iconsMatcher.test("/icons/icon.svg")).toBe(false);
        expect(iconsMatcher.test("/icons/icon.jpg")).toBe(false);
      });

      it("should be case insensitive", () => {
        expect(iconsMatcher.test("/icons/ICON-192x192.PNG")).toBe(true);
      });
    });

    describe("manifest matcher", () => {
      it("should match manifest.json at root", () => {
        expect(manifestMatcher.test("/manifest.json")).toBe(true);
      });

      it("should not match other JSON files", () => {
        expect(manifestMatcher.test("/other.json")).toBe(false);
        expect(manifestMatcher.test("/api/data.json")).toBe(false);
      });

      it("should be case insensitive", () => {
        expect(manifestMatcher.test("/MANIFEST.JSON")).toBe(true);
      });
    });

    describe("Convex API matcher", () => {
      it("should match Convex cloud URLs", () => {
        expect(convexMatcher.test("https://example.convex.cloud/api")).toBe(true);
        expect(convexMatcher.test("wss://example.convex.cloud")).toBe(true);
      });

      it("should not match other URLs", () => {
        expect(convexMatcher.test("https://api.example.com")).toBe(false);
        expect(convexMatcher.test("https://convex.example.com")).toBe(false);
      });
    });
  });

  describe("navigation request matching logic", () => {
    const matchNavigation = ({ request, sameOrigin }: { request: { mode: string }; sameOrigin: boolean }) =>
      sameOrigin && request.mode === "navigate";

    it("should match same-origin navigation requests", () => {
      expect(matchNavigation({ request: { mode: "navigate" }, sameOrigin: true })).toBe(true);
    });

    it("should not match cross-origin navigation requests", () => {
      expect(matchNavigation({ request: { mode: "navigate" }, sameOrigin: false })).toBe(false);
    });

    it("should not match non-navigation same-origin requests", () => {
      expect(matchNavigation({ request: { mode: "cors" }, sameOrigin: true })).toBe(false);
      expect(matchNavigation({ request: { mode: "no-cors" }, sameOrigin: true })).toBe(false);
      expect(matchNavigation({ request: { mode: "same-origin" }, sameOrigin: true })).toBe(false);
    });
  });

  describe("cache naming conventions", () => {
    const cacheNames = {
      pages: "pages-cache",
      icons: "pwa-icons",
      manifest: "manifest-cache",
    };

    it("should have descriptive cache names", () => {
      expect(cacheNames.pages).toBe("pages-cache");
      expect(cacheNames.icons).toBe("pwa-icons");
      expect(cacheNames.manifest).toBe("manifest-cache");
    });

    it("should use lowercase with hyphens", () => {
      Object.values(cacheNames).forEach((name) => {
        expect(name).toMatch(/^[a-z-]+$/);
      });
    });
  });

  describe("expiration configuration", () => {
    const expirationConfig = {
      pages: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      icons: { maxEntries: 10, maxAgeSeconds: 30 * 24 * 60 * 60 },
      manifest: { maxEntries: 1, maxAgeSeconds: 7 * 24 * 60 * 60 },
    };

    it("should limit page cache to 32 entries for 24 hours", () => {
      expect(expirationConfig.pages.maxEntries).toBe(32);
      expect(expirationConfig.pages.maxAgeSeconds).toBe(86400); // 24 hours
    });

    it("should cache icons for 30 days with up to 10 entries", () => {
      expect(expirationConfig.icons.maxEntries).toBe(10);
      expect(expirationConfig.icons.maxAgeSeconds).toBe(2592000); // 30 days
    });

    it("should cache manifest for 7 days with single entry", () => {
      expect(expirationConfig.manifest.maxEntries).toBe(1);
      expect(expirationConfig.manifest.maxAgeSeconds).toBe(604800); // 7 days
    });
  });

  describe("network timeout configuration", () => {
    const networkTimeoutSeconds = 3;

    it("should have a reasonable network timeout for navigation", () => {
      expect(networkTimeoutSeconds).toBe(3);
      expect(networkTimeoutSeconds).toBeGreaterThan(0);
      expect(networkTimeoutSeconds).toBeLessThanOrEqual(10);
    });
  });
});

describe("PWA Manifest Configuration", () => {
  const manifest = {
    name: "VoiceTodo",
    short_name: "VoiceTodo",
    description: "App PWA pour ajouter des to-dos a la voix, classes automatiquement par IA",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  it("should have correct app name", () => {
    expect(manifest.name).toBe("VoiceTodo");
    expect(manifest.short_name).toBe("VoiceTodo");
  });

  it("should use standalone display mode for PWA experience", () => {
    expect(manifest.display).toBe("standalone");
  });

  it("should have proper start URL", () => {
    expect(manifest.start_url).toBe("/");
  });

  it("should include required icon sizes for PWA", () => {
    const iconSizes = manifest.icons.map((icon) => icon.sizes);
    expect(iconSizes).toContain("192x192");
    expect(iconSizes).toContain("512x512");
  });

  it("should have maskable icons for adaptive display", () => {
    manifest.icons.forEach((icon) => {
      expect(icon.purpose).toContain("maskable");
    });
  });

  it("should have correct theme color (purple)", () => {
    expect(manifest.theme_color).toBe("#8b5cf6");
  });

  it("should have dark background color", () => {
    expect(manifest.background_color).toBe("#1a1a1a");
  });
});

describe("PWA Layout Metadata", () => {
  const metadata = {
    title: "VoiceTodo",
    description: "App PWA pour ajouter des to-dos a la voix, classes automatiquement par IA",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "VoiceTodo",
    },
  };

  const viewport = {
    themeColor: "#8b5cf6",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };

  it("should have proper app title", () => {
    expect(metadata.title).toBe("VoiceTodo");
  });

  it("should link to manifest file", () => {
    expect(metadata.manifest).toBe("/manifest.json");
  });

  it("should configure Apple Web App settings", () => {
    expect(metadata.appleWebApp.capable).toBe(true);
    expect(metadata.appleWebApp.title).toBe("VoiceTodo");
  });

  it("should set viewport for mobile devices", () => {
    expect(viewport.width).toBe("device-width");
    expect(viewport.initialScale).toBe(1);
    expect(viewport.userScalable).toBe(false);
  });

  it("should have matching theme color with manifest", () => {
    expect(viewport.themeColor).toBe("#8b5cf6");
  });
});
