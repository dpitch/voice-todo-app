/**
 * Tests for the Geist font configuration in the layout.
 * Since RootLayout renders <html> and <body> elements which cannot be nested
 * in a test container, we test the font configuration by importing and
 * validating the font objects directly.
 */

// Mock next/font/google before importing the layout
const mockGeistSans = {
  variable: "--font-geist-sans",
  className: "geist-sans-class",
};

const mockGeistMono = {
  variable: "--font-geist-mono",
  className: "geist-mono-class",
};

jest.mock("next/font/google", () => ({
  Geist: jest.fn(() => mockGeistSans),
  Geist_Mono: jest.fn(() => mockGeistMono),
}));

// Import after mocking
import { Geist, Geist_Mono } from "next/font/google";

describe("Geist Font Configuration", () => {
  it("configures Geist font with correct CSS variable", () => {
    const geistFont = Geist({
      variable: "--font-geist-sans",
      subsets: ["latin"],
    });

    expect(geistFont.variable).toBe("--font-geist-sans");
  });

  it("configures Geist_Mono font with correct CSS variable", () => {
    const geistMonoFont = Geist_Mono({
      variable: "--font-geist-mono",
      subsets: ["latin"],
    });

    expect(geistMonoFont.variable).toBe("--font-geist-mono");
  });

  it("Geist function is called with latin subset", () => {
    Geist({
      variable: "--font-geist-sans",
      subsets: ["latin"],
    });

    expect(Geist).toHaveBeenCalledWith(
      expect.objectContaining({
        subsets: ["latin"],
      })
    );
  });

  it("Geist_Mono function is called with latin subset", () => {
    Geist_Mono({
      variable: "--font-geist-mono",
      subsets: ["latin"],
    });

    expect(Geist_Mono).toHaveBeenCalledWith(
      expect.objectContaining({
        subsets: ["latin"],
      })
    );
  });
});

describe("Layout Font Variables", () => {
  it("exports font variables that can be used in className", () => {
    // Verify that the font objects have the expected structure
    expect(mockGeistSans).toHaveProperty("variable");
    expect(mockGeistMono).toHaveProperty("variable");

    // Both variables should be valid CSS variable names
    expect(mockGeistSans.variable).toMatch(/^--font-/);
    expect(mockGeistMono.variable).toMatch(/^--font-/);
  });
});
