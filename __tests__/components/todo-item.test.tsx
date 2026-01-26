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

  it("calls onToggleComplete when checkbox is clicked (after celebration animation)", () => {
    jest.useFakeTimers();
    const handleToggle = jest.fn();
    render(<TodoItem {...defaultProps} onToggleComplete={handleToggle} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    
    // The callback is delayed by 1200ms for the celebration animation
    expect(handleToggle).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1200);
    expect(handleToggle).toHaveBeenCalledWith(true);
    jest.useRealTimers();
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

  describe("drag handle (useSortable)", () => {
    it("renders the drag handle button", () => {
      render(<TodoItem {...defaultProps} />);
      const dragHandle = document.querySelector("[data-slot='drag-handle']");
      expect(dragHandle).toBeInTheDocument();
    });

    it("drag handle has accessible label", () => {
      render(<TodoItem {...defaultProps} />);
      const dragHandle = screen.getByRole("button", { name: /drag to reorder/i });
      expect(dragHandle).toBeInTheDocument();
    });

    it("drag handle has cursor-grab class", () => {
      render(<TodoItem {...defaultProps} />);
      const dragHandle = document.querySelector("[data-slot='drag-handle']");
      expect(dragHandle).toHaveClass("cursor-grab");
    });

    it("drag handle has touch-none class for touch devices", () => {
      render(<TodoItem {...defaultProps} />);
      const dragHandle = document.querySelector("[data-slot='drag-handle']");
      expect(dragHandle).toHaveClass("touch-none");
    });

    it("drag handle receives sortable attributes", () => {
      render(<TodoItem {...defaultProps} />);
      const dragHandle = document.querySelector("[data-slot='drag-handle']");
      expect(dragHandle).toHaveAttribute("role", "button");
      expect(dragHandle).toHaveAttribute("tabIndex", "0");
    });

    it("has data-dragging attribute set to false by default", () => {
      render(<TodoItem {...defaultProps} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).toHaveAttribute("data-dragging", "false");
    });
  });

  describe("category change animation", () => {
    it("has data-category-changed attribute set to false by default", () => {
      render(<TodoItem {...defaultProps} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).toHaveAttribute("data-category-changed", "false");
    });

    it("has data-category-changed attribute set to true when isCategoryChanged is true", () => {
      render(<TodoItem {...defaultProps} isCategoryChanged={true} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).toHaveAttribute("data-category-changed", "true");
    });

    it("applies animate-category-change class when isCategoryChanged is true", () => {
      render(<TodoItem {...defaultProps} isCategoryChanged={true} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).toHaveClass("animate-category-change");
    });

    it("does not apply animate-category-change class when isCategoryChanged is false", () => {
      render(<TodoItem {...defaultProps} isCategoryChanged={false} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).not.toHaveClass("animate-category-change");
    });

    it("does not apply animate-category-change class when isCategoryChanged is undefined", () => {
      render(<TodoItem {...defaultProps} />);
      const card = document.querySelector("[data-slot='todo-item']");
      expect(card).not.toHaveClass("animate-category-change");
    });
  });
});
