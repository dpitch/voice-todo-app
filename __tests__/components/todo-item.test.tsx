import { render, screen, fireEvent } from "@testing-library/react";
import { TodoItem, type Priority } from "@/components/todo-item";

describe("TodoItem component", () => {
  const defaultProps = {
    id: "test-todo-1",
    content: "Buy groceries",
    priority: "medium" as Priority,
    isCompleted: false,
  };

  it("renders the todo item with content", () => {
    render(<TodoItem {...defaultProps} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("renders with data-slot attribute", () => {
    render(<TodoItem {...defaultProps} />);
    const card = screen.getByText("Buy groceries").closest("[data-slot='todo-item']");
    expect(card).toBeInTheDocument();
  });

  it("renders the checkbox", () => {
    render(<TodoItem {...defaultProps} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("checkbox is unchecked when isCompleted is false", () => {
    render(<TodoItem {...defaultProps} isCompleted={false} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("checkbox is checked when isCompleted is true", () => {
    render(<TodoItem {...defaultProps} isCompleted={true} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onToggleComplete when checkbox is clicked", () => {
    const handleToggle = jest.fn();
    render(<TodoItem {...defaultProps} onToggleComplete={handleToggle} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it("checkbox has accessible label", () => {
    render(<TodoItem {...defaultProps} />);
    const checkbox = screen.getByRole("checkbox", {
      name: /mark "buy groceries" as complete/i,
    });
    expect(checkbox).toBeInTheDocument();
  });

  it("checkbox label changes when completed", () => {
    render(<TodoItem {...defaultProps} isCompleted={true} />);
    const checkbox = screen.getByRole("checkbox", {
      name: /mark "buy groceries" as incomplete/i,
    });
    expect(checkbox).toBeInTheDocument();
  });

  describe("priority dot", () => {
    it("renders the priority dot", () => {
      render(<TodoItem {...defaultProps} />);
      const priorityDot = document.querySelector("[data-slot='priority-dot']");
      expect(priorityDot).toBeInTheDocument();
    });

    it("priority dot has accessible label", () => {
      render(<TodoItem {...defaultProps} priority="high" />);
      const priorityDot = screen.getByLabelText("high priority");
      expect(priorityDot).toBeInTheDocument();
    });

    it("renders with high priority class", () => {
      render(<TodoItem {...defaultProps} priority="high" />);
      const priorityDot = document.querySelector("[data-slot='priority-dot']");
      expect(priorityDot).toHaveClass("bg-priority-high");
    });

    it("renders with medium priority class", () => {
      render(<TodoItem {...defaultProps} priority="medium" />);
      const priorityDot = document.querySelector("[data-slot='priority-dot']");
      expect(priorityDot).toHaveClass("bg-priority-medium");
    });

    it("renders with low priority class", () => {
      render(<TodoItem {...defaultProps} priority="low" />);
      const priorityDot = document.querySelector("[data-slot='priority-dot']");
      expect(priorityDot).toHaveClass("bg-priority-low");
    });
  });

  describe("data attributes", () => {
    it("has data-priority attribute", () => {
      render(<TodoItem {...defaultProps} priority="high" />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).toHaveAttribute("data-priority", "high");
    });

    it("has data-completed attribute set to false", () => {
      render(<TodoItem {...defaultProps} isCompleted={false} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).toHaveAttribute("data-completed", "false");
    });

    it("has data-completed attribute set to true", () => {
      render(<TodoItem {...defaultProps} isCompleted={true} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).toHaveAttribute("data-completed", "true");
    });
  });

  describe("completed state styling", () => {
    it("applies opacity when completed", () => {
      render(<TodoItem {...defaultProps} isCompleted={true} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).toHaveClass("opacity-60");
    });

    it("applies line-through to content when completed", () => {
      render(<TodoItem {...defaultProps} isCompleted={true} />);
      const content = document.querySelector("[data-slot='todo-content']");
      expect(content).toHaveClass("line-through");
    });

    it("does not apply line-through when not completed", () => {
      render(<TodoItem {...defaultProps} isCompleted={false} />);
      const content = document.querySelector("[data-slot='todo-content']");
      expect(content).not.toHaveClass("line-through");
    });
  });

  it("applies custom className", () => {
    render(<TodoItem {...defaultProps} className="custom-class" />);
    const card = document.querySelector("[data-slot='todo-item']");
    expect(card).toHaveClass("custom-class");
  });
});
