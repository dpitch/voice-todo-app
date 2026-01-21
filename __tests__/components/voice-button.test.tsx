import { render, screen, fireEvent } from "@testing-library/react";
import { VoiceButton } from "@/components/voice-button";

describe("VoiceButton component", () => {
  describe("rendering", () => {
    it("renders the voice-button element", () => {
      render(<VoiceButton />);
      const button = screen.getByRole("button", { name: /start recording/i });
      expect(button).toBeInTheDocument();
    });

    it("has data-slot attribute", () => {
      render(<VoiceButton />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toBeInTheDocument();
    });

    it("has data-state attribute", () => {
      render(<VoiceButton state="idle" />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveAttribute("data-state", "idle");
    });

    it("contains an svg icon", () => {
      render(<VoiceButton />);
      const button = screen.getByRole("button", { name: /start recording/i });
      const svgIcon = button.querySelector("svg");
      expect(svgIcon).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      render(<VoiceButton className="custom-class" />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("idle state", () => {
    it("renders with idle state by default", () => {
      render(<VoiceButton />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveAttribute("data-state", "idle");
    });

    it("has ghost variant in idle state", () => {
      render(<VoiceButton state="idle" />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveAttribute("data-variant", "ghost");
    });

    it("has correct aria-label in idle state", () => {
      render(<VoiceButton state="idle" />);
      const button = screen.getByRole("button", { name: /start recording/i });
      expect(button).toBeInTheDocument();
    });

    it("is not disabled in idle state", () => {
      render(<VoiceButton state="idle" />);
      const button = screen.getByRole("button", { name: /start recording/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("recording state", () => {
    it("has data-state recording when in recording state", () => {
      render(<VoiceButton state="recording" />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveAttribute("data-state", "recording");
    });

    it("has destructive variant in recording state", () => {
      render(<VoiceButton state="recording" />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveAttribute("data-variant", "destructive");
    });

    it("has correct aria-label in recording state", () => {
      render(<VoiceButton state="recording" />);
      const button = screen.getByRole("button", { name: /stop recording/i });
      expect(button).toBeInTheDocument();
    });

    it("has animate-recording-pulse class in recording state", () => {
      render(<VoiceButton state="recording" />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveClass("animate-recording-pulse");
    });

    it("is not disabled in recording state", () => {
      render(<VoiceButton state="recording" />);
      const button = screen.getByRole("button", { name: /stop recording/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("processing state", () => {
    it("has data-state processing when in processing state", () => {
      render(<VoiceButton state="processing" />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveAttribute("data-state", "processing");
    });

    it("has ghost variant in processing state", () => {
      render(<VoiceButton state="processing" />);
      const button = document.querySelector('[data-slot="voice-button"]');
      expect(button).toHaveAttribute("data-variant", "ghost");
    });

    it("has correct aria-label in processing state", () => {
      render(<VoiceButton state="processing" />);
      const button = screen.getByRole("button", {
        name: /processing voice input/i,
      });
      expect(button).toBeInTheDocument();
    });

    it("is disabled in processing state", () => {
      render(<VoiceButton state="processing" />);
      const button = screen.getByRole("button", {
        name: /processing voice input/i,
      });
      expect(button).toBeDisabled();
    });

    it("contains spinning loader icon in processing state", () => {
      render(<VoiceButton state="processing" />);
      const button = screen.getByRole("button", {
        name: /processing voice input/i,
      });
      const svgIcon = button.querySelector("svg");
      expect(svgIcon).toHaveClass("animate-spin");
    });
  });

  describe("interactions", () => {
    it("calls onRecord when clicked in idle state", () => {
      const handleRecord = jest.fn();
      render(<VoiceButton state="idle" onRecord={handleRecord} />);
      const button = screen.getByRole("button", { name: /start recording/i });
      fireEvent.click(button);
      expect(handleRecord).toHaveBeenCalledTimes(1);
    });

    it("calls onStop when clicked in recording state", () => {
      const handleStop = jest.fn();
      render(<VoiceButton state="recording" onStop={handleStop} />);
      const button = screen.getByRole("button", { name: /stop recording/i });
      fireEvent.click(button);
      expect(handleStop).toHaveBeenCalledTimes(1);
    });

    it("does not call onRecord when clicked in processing state", () => {
      const handleRecord = jest.fn();
      render(<VoiceButton state="processing" onRecord={handleRecord} />);
      const button = screen.getByRole("button", {
        name: /processing voice input/i,
      });
      fireEvent.click(button);
      expect(handleRecord).not.toHaveBeenCalled();
    });

    it("does not call onStop when clicked in idle state", () => {
      const handleStop = jest.fn();
      render(<VoiceButton state="idle" onStop={handleStop} />);
      const button = screen.getByRole("button", { name: /start recording/i });
      fireEvent.click(button);
      expect(handleStop).not.toHaveBeenCalled();
    });

    it("does not call onRecord when clicked in recording state", () => {
      const handleRecord = jest.fn();
      render(<VoiceButton state="recording" onRecord={handleRecord} />);
      const button = screen.getByRole("button", { name: /stop recording/i });
      fireEvent.click(button);
      expect(handleRecord).not.toHaveBeenCalled();
    });
  });

  describe("disabled prop", () => {
    it("is disabled when disabled prop is true", () => {
      render(<VoiceButton disabled />);
      const button = screen.getByRole("button", { name: /start recording/i });
      expect(button).toBeDisabled();
    });

    it("does not call onRecord when disabled", () => {
      const handleRecord = jest.fn();
      render(<VoiceButton state="idle" disabled onRecord={handleRecord} />);
      const button = screen.getByRole("button", { name: /start recording/i });
      fireEvent.click(button);
      expect(handleRecord).not.toHaveBeenCalled();
    });

    it("does not call onStop when disabled in recording state", () => {
      const handleStop = jest.fn();
      render(<VoiceButton state="recording" disabled onStop={handleStop} />);
      const button = screen.getByRole("button", { name: /stop recording/i });
      fireEvent.click(button);
      expect(handleStop).not.toHaveBeenCalled();
    });
  });
});
