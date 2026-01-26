import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  moduleNameMapper: {
    // Mock convex/_generated/server imports (all patterns)
    "^\\./_generated/server(\\.js)?$": "<rootDir>/__mocks__/convex/_generated/server.ts",
    "^(\\.\\./)*convex/_generated/server(\\.js)?$": "<rootDir>/__mocks__/convex/_generated/server.ts",
    // Mock convex/_generated/api imports
    "^\\./_generated/api(\\.js)?$": "<rootDir>/__mocks__/convex/_generated/api.ts",
    "^@/convex/_generated/(.*?)(\\.js)?$": "<rootDir>/__mocks__/convex/_generated/$1.ts",
    "^(\\.\\./)*convex/_generated/(.*?)(\\.js)?$":
      "<rootDir>/__mocks__/convex/_generated/$2.ts",
    // Mock convex/server and convex/values for direct imports from node_modules
    "^convex/server$": "<rootDir>/__mocks__/convex/server.ts",
    "^convex/values$": "<rootDir>/__mocks__/convex/values.ts",
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
