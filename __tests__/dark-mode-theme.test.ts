import { readFileSync } from "fs";
import { join } from "path";

describe("Dark Mode Theme Configuration", () => {
  let globalsCss: string;

  beforeAll(() => {
    const cssPath = join(process.cwd(), "app/globals.css");
    globalsCss = readFileSync(cssPath, "utf-8");
  });

  describe("OKLCH palette in dark mode", () => {
    it("should have dark mode background color matching PRD spec", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--background:\s*oklch\(0\.13\s+0\s+0\)/s);
    });

    it("should have dark mode foreground color matching PRD spec", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--foreground:\s*oklch\(0\.98\s+0\s+0\)/s);
    });

    it("should have dark mode card color matching PRD spec", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--card:\s*oklch\(0\.18\s+0\s+0\)/s);
    });

    it("should have dark mode border color matching PRD spec", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--border:\s*oklch\(0\.25\s+0\s+0\)/s);
    });

    it("should have dark mode muted-foreground color matching PRD spec", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--muted-foreground:\s*oklch\(0\.65\s+0\s+0\)/s);
    });

    it("should have violet accent color in dark mode", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--accent:\s*oklch\(0\.65\s+0\.15\s+270\)/s);
    });

    it("should have violet primary color in dark mode", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--primary:\s*oklch\(0\.65\s+0\.15\s+270\)/s);
    });
  });

  describe("Priority colors", () => {
    it("should have priority-high color for urgent tasks (red)", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--priority-high:\s*oklch\(0\.65\s+0\.2\s+25\)/s);
    });

    it("should have priority-medium color for normal tasks (orange)", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--priority-medium:\s*oklch\(0\.7\s+0\.15\s+50\)/s);
    });

    it("should have priority-low color for low priority tasks (grey)", () => {
      expect(globalsCss).toMatch(/\.dark\s*\{[^}]*--priority-low:\s*oklch\(0\.5\s+0\s+0\)/s);
    });

    it("should expose priority colors in @theme inline section", () => {
      expect(globalsCss).toContain("--color-priority-high: var(--priority-high)");
      expect(globalsCss).toContain("--color-priority-medium: var(--priority-medium)");
      expect(globalsCss).toContain("--color-priority-low: var(--priority-low)");
    });
  });

  describe("Light mode priority colors", () => {
    it("should have priority colors defined in :root for light mode", () => {
      expect(globalsCss).toMatch(/:root\s*\{[^}]*--priority-high:/s);
      expect(globalsCss).toMatch(/:root\s*\{[^}]*--priority-medium:/s);
      expect(globalsCss).toMatch(/:root\s*\{[^}]*--priority-low:/s);
    });
  });

  describe("Dark mode custom variant", () => {
    it("should have dark mode custom variant defined", () => {
      expect(globalsCss).toContain("@custom-variant dark");
    });
  });
});
