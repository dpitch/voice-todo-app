import { render, screen, fireEvent } from "@testing-library/react";
import { InputBar } from "@/components/input-bar";

describe("InputBar component", () => {
  it("renders the input-bar element", () => {
    render(<InputBar />);
    const inputBar = screen.getByRole("textbox", { name: /task input/i });
    expect(inputBar).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<InputBar />);
    const container = document.querySelector('[data-slot="input-bar"]');
    expect(container).toBeInTheDocument();
  });

  it("renders with fixed bottom positioning classes", () => {
    render(<InputBar />);
    const container = document.querySelector('[data-slot="input-bar"]');
    expect(container).toHaveClass("fixed", "bottom-0", "left-0", "right-0");
  });

  it("renders the voice button", () => {
    render(<InputBar />);
    const voiceButton = screen.getByRole("button", { name: /start recording/i });
    expect(voiceButton).toBeInTheDocument();
  });

  it("voice button has ghost variant and icon size in idle state", () => {
    render(<InputBar voiceState="idle" />);
    const voiceButton = document.querySelector('[data-slot="voice-button"]');
    expect(voiceButton).toHaveAttribute("data-variant", "ghost");
    expect(voiceButton).toHaveAttribute("data-size", "icon");
  });

  it("contains the Mic icon", () => {
    render(<InputBar />);
    const voiceButton = screen.getByRole("button", { name: /start recording/i });
    const svgIcon = voiceButton.querySelector("svg");
    expect(svgIcon).toBeInTheDocument();
  });

  it("displays default placeholder text", () => {
    render(<InputBar />);
    const input = screen.getByPlaceholderText("Ajouter un todo...");
    expect(input).toBeInTheDocument();
  });

  it("displays custom placeholder text", () => {
    render(<InputBar placeholder="Custom placeholder" />);
    const input = screen.getByPlaceholderText("Custom placeholder");
    expect(input).toBeInTheDocument();
  });

  it("calls onChange when input value changes", () => {
    const handleChange = jest.fn();
    render(<InputBar onChange={handleChange} />);
    const input = screen.getByRole("textbox", { name: /task input/i });
    fireEvent.change(input, { target: { value: "New task" } });
    expect(handleChange).toHaveBeenCalledWith("New task");
  });

  it("calls onSubmit when Enter is pressed with non-empty value", () => {
    const handleSubmit = jest.fn();
    render(<InputBar value="My task" onSubmit={handleSubmit} />);
    const input = screen.getByRole("textbox", { name: /task input/i });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleSubmit).toHaveBeenCalledWith("My task");
  });

  it("does not call onSubmit when Enter is pressed with empty value", () => {
    const handleSubmit = jest.fn();
    render(<InputBar value="" onSubmit={handleSubmit} />);
    const input = screen.getByRole("textbox", { name: /task input/i });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit when Enter is pressed with whitespace-only value", () => {
    const handleSubmit = jest.fn();
    render(<InputBar value="   " onSubmit={handleSubmit} />);
    const input = screen.getByRole("textbox", { name: /task input/i });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("trims the value when submitting", () => {
    const handleSubmit = jest.fn();
    render(<InputBar value="  My task  " onSubmit={handleSubmit} />);
    const input = screen.getByRole("textbox", { name: /task input/i });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleSubmit).toHaveBeenCalledWith("My task");
  });

  it("calls onRecord when voice button is clicked in idle state", () => {
    const handleRecord = jest.fn();
    render(<InputBar voiceState="idle" onRecord={handleRecord} />);
    const voiceButton = screen.getByRole("button", { name: /start recording/i });
    fireEvent.click(voiceButton);
    expect(handleRecord).toHaveBeenCalled();
  });

  it("calls onStopRecording when voice button is clicked in recording state", () => {
    const handleStopRecording = jest.fn();
    render(<InputBar voiceState="recording" onStopRecording={handleStopRecording} />);
    const voiceButton = screen.getByRole("button", { name: /stop recording/i });
    fireEvent.click(voiceButton);
    expect(handleStopRecording).toHaveBeenCalled();
  });

  it("shows recording state on voice button", () => {
    render(<InputBar voiceState="recording" />);
    const voiceButton = document.querySelector('[data-slot="voice-button"]');
    expect(voiceButton).toHaveAttribute("data-state", "recording");
  });

  it("shows processing state on voice button", () => {
    render(<InputBar voiceState="processing" />);
    const voiceButton = document.querySelector('[data-slot="voice-button"]');
    expect(voiceButton).toHaveAttribute("data-state", "processing");
  });

  it("accepts custom className", () => {
    render(<InputBar className="custom-class" />);
    const container = document.querySelector('[data-slot="input-bar"]');
    expect(container).toHaveClass("custom-class");
  });

  it("displays the provided value", () => {
    render(<InputBar value="Test value" />);
    const input = screen.getByRole("textbox", { name: /task input/i });
    expect(input).toHaveValue("Test value");
  });
});
