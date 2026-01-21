import { existsSync, readFileSync } from "fs";
import { join } from "path";

describe("Serwist PWA Configuration", () => {
  const rootDir = process.cwd();

  describe("Service Worker", () => {
    it("should have sw.ts file in app directory", () => {
      const swPath = join(rootDir, "app", "sw.ts");
      expect(existsSync(swPath)).toBe(true);
    });

    it("should import defaultCache from @serwist/next/worker", () => {
      const swPath = join(rootDir, "app", "sw.ts");
      const content = readFileSync(swPath, "utf-8");
      expect(content).toContain(
        'import { defaultCache } from "@serwist/next/worker"'
      );
    });

    it("should import Serwist from serwist", () => {
      const swPath = join(rootDir, "app", "sw.ts");
      const content = readFileSync(swPath, "utf-8");
      // Multi-line import, check for both the class and the module
      expect(content).toContain("Serwist");
      expect(content).toContain('from "serwist"');
    });

    it("should configure Serwist with required options", () => {
      const swPath = join(rootDir, "app", "sw.ts");
      const content = readFileSync(swPath, "utf-8");
      expect(content).toContain("precacheEntries: self.__SW_MANIFEST");
      expect(content).toContain("skipWaiting: true");
      expect(content).toContain("clientsClaim: true");
    });

    it("should call addEventListeners", () => {
      const swPath = join(rootDir, "app", "sw.ts");
      const content = readFileSync(swPath, "utf-8");
      expect(content).toContain("serwist.addEventListeners()");
    });
  });

  describe("Next.js Configuration", () => {
    it("should have next.config.ts file", () => {
      const configPath = join(rootDir, "next.config.ts");
      expect(existsSync(configPath)).toBe(true);
    });

    it("should import withSerwistInit from @serwist/next", () => {
      const configPath = join(rootDir, "next.config.ts");
      const content = readFileSync(configPath, "utf-8");
      expect(content).toContain(
        'import withSerwistInit from "@serwist/next"'
      );
    });

    it("should configure swSrc and swDest", () => {
      const configPath = join(rootDir, "next.config.ts");
      const content = readFileSync(configPath, "utf-8");
      expect(content).toContain('swSrc: "app/sw.ts"');
      expect(content).toContain('swDest: "public/sw.js"');
    });

    it("should wrap nextConfig with withSerwist", () => {
      const configPath = join(rootDir, "next.config.ts");
      const content = readFileSync(configPath, "utf-8");
      expect(content).toContain("export default withSerwist(nextConfig)");
    });

    it("should disable Serwist in non-production environments", () => {
      const configPath = join(rootDir, "next.config.ts");
      const content = readFileSync(configPath, "utf-8");
      expect(content).toContain('disable: process.env.NODE_ENV !== "production"');
    });

    it("should configure turbopack for Next.js 16 compatibility", () => {
      const configPath = join(rootDir, "next.config.ts");
      const content = readFileSync(configPath, "utf-8");
      expect(content).toContain("turbopack: {}");
    });
  });

  describe("TypeScript Configuration", () => {
    it("should have tsconfig.json file", () => {
      const tsconfigPath = join(rootDir, "tsconfig.json");
      expect(existsSync(tsconfigPath)).toBe(true);
    });

    it("should include webworker in lib", () => {
      const tsconfigPath = join(rootDir, "tsconfig.json");
      const content = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
      expect(content.compilerOptions.lib).toContain("webworker");
    });

    it("should include @serwist/next/typings in types", () => {
      const tsconfigPath = join(rootDir, "tsconfig.json");
      const content = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
      expect(content.compilerOptions.types).toContain("@serwist/next/typings");
    });

    it("should exclude public/sw.js from compilation", () => {
      const tsconfigPath = join(rootDir, "tsconfig.json");
      const content = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
      expect(content.exclude).toContain("public/sw.js");
    });
  });

  describe("Git Configuration", () => {
    it("should have .gitignore file", () => {
      const gitignorePath = join(rootDir, ".gitignore");
      expect(existsSync(gitignorePath)).toBe(true);
    });

    it("should ignore generated service worker files", () => {
      const gitignorePath = join(rootDir, ".gitignore");
      const content = readFileSync(gitignorePath, "utf-8");
      expect(content).toContain("public/sw*");
      expect(content).toContain("public/swe-worker*");
    });
  });

  describe("Dependencies", () => {
    it("should have @serwist/next as a dependency", () => {
      const packageJsonPath = join(rootDir, "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      expect(packageJson.dependencies["@serwist/next"]).toBeDefined();
    });

    it("should have serwist as a dependency", () => {
      const packageJsonPath = join(rootDir, "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      expect(packageJson.dependencies["serwist"]).toBeDefined();
    });
  });
});
