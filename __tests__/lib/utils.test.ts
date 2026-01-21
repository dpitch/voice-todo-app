import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("merges class names correctly", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("removes falsy values", () => {
    const result = cn("base-class", false && "hidden", null, undefined, "visible");
    expect(result).toBe("base-class visible");
  });

  it("merges conflicting Tailwind classes correctly", () => {
    // tailwind-merge should keep the last conflicting class
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("handles array inputs", () => {
    const result = cn(["class-1", "class-2"]);
    expect(result).toBe("class-1 class-2");
  });

  it("handles object inputs with clsx", () => {
    const result = cn({
      "base-class": true,
      "conditional-class": true,
      "disabled-class": false,
    });
    expect(result).toBe("base-class conditional-class");
  });

  it("handles mixed inputs", () => {
    const result = cn(
      "static-class",
      ["array-class"],
      { "object-class": true },
      undefined,
      "another-class"
    );
    expect(result).toBe("static-class array-class object-class another-class");
  });

  it("returns empty string for no inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles complex Tailwind merge scenarios", () => {
    // Testing that conflicting utilities are properly merged
    const result = cn(
      "text-red-500 bg-blue-500",
      "text-green-500" // This should override text-red-500
    );
    expect(result).toBe("bg-blue-500 text-green-500");
  });
});
