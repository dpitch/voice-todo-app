import { transcribeAudio } from "../convex/ai";

describe("Convex AI Actions", () => {
  describe("transcribeAudio action", () => {
    it("should be defined", () => {
      expect(transcribeAudio).toBeDefined();
    });

    it("should be an action function", () => {
      expect(transcribeAudio).toHaveProperty("isAction", true);
    });

    it("should require audioData argument", () => {
      expect(transcribeAudio.args).toHaveProperty("audioData");
    });

    it("should have a handler function", () => {
      expect(transcribeAudio.handler).toBeDefined();
      expect(typeof transcribeAudio.handler).toBe("function");
    });
  });
});
