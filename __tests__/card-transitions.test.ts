import fs from "fs";
import path from "path";

describe("Card CSS transitions", () => {
  const globalsCssPath = path.join(process.cwd(), "app", "globals.css");
  let globalsCss: string;

  beforeAll(() => {
    globalsCss = fs.readFileSync(globalsCssPath, "utf-8");
  });

  describe("keyframe animations", () => {
    it("defines card-fade-in keyframe animation", () => {
      expect(globalsCss).toContain("@keyframes card-fade-in");
      expect(globalsCss).toMatch(/card-fade-in[\s\S]*?from[\s\S]*?opacity:\s*0/);
      expect(globalsCss).toMatch(/card-fade-in[\s\S]*?to[\s\S]*?opacity:\s*1/);
    });

    it("defines card-slide-in keyframe animation", () => {
      expect(globalsCss).toContain("@keyframes card-slide-in");
      expect(globalsCss).toMatch(
        /card-slide-in[\s\S]*?from[\s\S]*?opacity:\s*0/
      );
      expect(globalsCss).toMatch(
        /card-slide-in[\s\S]*?from[\s\S]*?transform:\s*translateY/
      );
      expect(globalsCss).toMatch(/card-slide-in[\s\S]*?to[\s\S]*?opacity:\s*1/);
      expect(globalsCss).toMatch(
        /card-slide-in[\s\S]*?to[\s\S]*?transform:\s*translateY\(0\)/
      );
    });
  });

  describe("animation utility classes", () => {
    it("defines animate-card-fade-in class", () => {
      expect(globalsCss).toContain(".animate-card-fade-in");
      expect(globalsCss).toMatch(
        /\.animate-card-fade-in[\s\S]*?animation:[\s\S]*?card-fade-in/
      );
    });

    it("defines animate-card-slide-in class", () => {
      expect(globalsCss).toContain(".animate-card-slide-in");
      expect(globalsCss).toMatch(
        /\.animate-card-slide-in[\s\S]*?animation:[\s\S]*?card-slide-in/
      );
    });
  });

  describe("card transition styles", () => {
    it("applies default transitions to card data-slot", () => {
      expect(globalsCss).toMatch(/\[data-slot="card"\][\s\S]*?transition:/);
    });

    it("card transitions include opacity", () => {
      expect(globalsCss).toMatch(/\[data-slot="card"\][\s\S]*?opacity/);
    });

    it("card transitions include transform", () => {
      expect(globalsCss).toMatch(/\[data-slot="card"\][\s\S]*?transform/);
    });

    it("card transitions include box-shadow", () => {
      expect(globalsCss).toMatch(/\[data-slot="card"\][\s\S]*?box-shadow/);
    });
  });

  describe("todo-item animation", () => {
    it("applies slide-in animation to todo-item data-slot", () => {
      expect(globalsCss).toMatch(/\[data-slot="todo-item"\][\s\S]*?animation:/);
      expect(globalsCss).toMatch(
        /\[data-slot="todo-item"\][\s\S]*?card-slide-in/
      );
    });
  });

  describe("animation timing", () => {
    it("uses ease-out timing function for fade-in", () => {
      expect(globalsCss).toMatch(/\.animate-card-fade-in[\s\S]*?ease-out/);
    });

    it("uses ease-out timing function for slide-in", () => {
      expect(globalsCss).toMatch(/\.animate-card-slide-in[\s\S]*?ease-out/);
    });

    it("uses forwards fill mode for animations", () => {
      expect(globalsCss).toMatch(/\.animate-card-fade-in[\s\S]*?forwards/);
      expect(globalsCss).toMatch(/\.animate-card-slide-in[\s\S]*?forwards/);
    });
  });

  describe("category change animation", () => {
    it("defines category-change keyframe animation", () => {
      expect(globalsCss).toContain("@keyframes category-change");
    });

    it("category-change animation includes opacity transform", () => {
      expect(globalsCss).toMatch(
        /category-change[\s\S]*?0%[\s\S]*?opacity:\s*0/
      );
      expect(globalsCss).toMatch(
        /category-change[\s\S]*?100%[\s\S]*?opacity:\s*1/
      );
    });

    it("category-change animation includes translateX transform", () => {
      expect(globalsCss).toMatch(
        /category-change[\s\S]*?transform:\s*translateX/
      );
    });

    it("category-change animation includes scale transform", () => {
      expect(globalsCss).toMatch(
        /category-change[\s\S]*?scale/
      );
    });

    it("category-change animation includes box-shadow glow effect", () => {
      expect(globalsCss).toMatch(
        /category-change[\s\S]*?box-shadow/
      );
    });

    it("defines animate-category-change utility class", () => {
      expect(globalsCss).toContain(".animate-category-change");
      expect(globalsCss).toMatch(
        /\.animate-category-change[\s\S]*?animation:[\s\S]*?category-change/
      );
    });

    it("animate-category-change uses ease-out timing function", () => {
      expect(globalsCss).toMatch(/\.animate-category-change[\s\S]*?ease-out/);
    });

    it("animate-category-change uses forwards fill mode", () => {
      expect(globalsCss).toMatch(/\.animate-category-change[\s\S]*?forwards/);
    });
  });
});
