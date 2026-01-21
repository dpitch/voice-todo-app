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

  it("renders the mic button", () => {
    render(<InputBar />);
    const micButton = screen.getByRole("button", { name: /voice input/i });
    expect(micButton).toBeInTheDocument();
  });

  it("mic button has ghost variant and icon size", () => {
    render(<InputBar />);
    const micButton = screen.getByRole("button", { name: /voice input/i });
    expect(micButton).toHaveAttribute("data-variant", "ghost");
    expect(micButton).toHaveAttribute("data-size", "icon");
  });

  it("contains the Mic icon", () => {
    render(<InputBar />);
    const micButton = screen.getByRole("button", { name: /voice input/i });
    const svgIcon = micButton.querySelector("svg");
    expect(svgIcon).toBeInTheDocument();
  });

  it("displays default placeholder text", () => {
    render(<InputBar />);
    const input = screen.getByPlaceholderText("Add a new task...");
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

  it("calls onMicClick when mic button is clicked", () => {
    const handleMicClick = jest.fn();
    render(<InputBar onMicClick={handleMicClick} />);
    const micButton = screen.getByRole("button", { name: /voice input/i });
    fireEvent.click(micButton);
    expect(handleMicClick).toHaveBeenCalled();
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
