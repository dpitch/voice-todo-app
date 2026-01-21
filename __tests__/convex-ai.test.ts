import { transcribeAudio, classifyTodo, processVoiceTodo } from "../convex/ai";

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

  describe("classifyTodo action", () => {
    it("should be defined", () => {
      expect(classifyTodo).toBeDefined();
    });

    it("should be an action function", () => {
      expect(classifyTodo).toHaveProperty("isAction", true);
    });

    it("should require content argument", () => {
      expect(classifyTodo.args).toHaveProperty("content");
    });

    it("should have a handler function", () => {
      expect(classifyTodo.handler).toBeDefined();
      expect(typeof classifyTodo.handler).toBe("function");
    });
  });

  describe("processVoiceTodo action", () => {
    it("should be defined", () => {
      expect(processVoiceTodo).toBeDefined();
    });

    it("should be an action function", () => {
      expect(processVoiceTodo).toHaveProperty("isAction", true);
    });

    it("should require audioData argument", () => {
      expect(processVoiceTodo.args).toHaveProperty("audioData");
    });

    it("should have a handler function", () => {
      expect(processVoiceTodo.handler).toBeDefined();
      expect(typeof processVoiceTodo.handler).toBe("function");
    });
  });
});
