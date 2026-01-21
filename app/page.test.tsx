import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./page";

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  useDroppable: jest.fn(() => ({ isOver: false, setNodeRef: jest.fn() })),
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

describe("Home page", () => {
  const mockCreateTodo = jest.fn();
  const mockToggleComplete = jest.fn();
  const mockUpdateCategory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockImplementation((mutationName: string) => {
      if (mutationName === "todos.create") return mockCreateTodo;
      if (mutationName === "todos.toggleComplete") return mockToggleComplete;
      if (mutationName === "todos.updateCategory") return mockUpdateCategory;
      return jest.fn();
    });
  });

  it("shows loading state when data is undefined", () => {
    mockUseQuery.mockReturnValue(undefined);

    render(<Home />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders header and input bar when data is loaded", () => {
    mockUseQuery.mockReturnValue([]);

    render(<Home />);

    expect(screen.getByText("📋 VoiceTodo")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /task input/i })).toBeInTheDocument();
  });

  it("shows empty state when there are no todos", () => {
    mockUseQuery.mockReturnValue([]);

    render(<Home />);

    expect(screen.getByText("No todos yet")).toBeInTheDocument();
  });

  it("renders active todos in the TodoList", () => {
    mockUseQuery.mockReturnValue([
      {
        _id: "todo-1",
        content: "Buy groceries",
        category: "Shopping",
        priority: "high",
        isCompleted: false,
        createdAt: Date.now(),
      },
      {
        _id: "todo-2",
        content: "Call mom",
        category: "Personal",
        priority: "medium",
        isCompleted: false,
        createdAt: Date.now(),
      },
    ]);

    render(<Home />);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Call mom")).toBeInTheDocument();
  });

  it("filters out completed todos from the main list", () => {
    mockUseQuery.mockReturnValue([
      {
        _id: "todo-1",
        content: "Active task",
        category: "Work",
        priority: "medium",
        isCompleted: false,
        createdAt: Date.now(),
      },
      {
        _id: "todo-2",
        content: "Completed task",
        category: "Work",
        priority: "low",
        isCompleted: true,
        completedAt: Date.now(),
        createdAt: Date.now() - 1000,
      },
    ]);

    render(<Home />);

    expect(screen.getByText("Active task")).toBeInTheDocument();
    // Completed task should be in the collapsed CompletedSection
    expect(screen.getByText(/Terminés/)).toBeInTheDocument();
  });

  it("calls createTodo mutation when submitting a new todo", async () => {
    mockUseQuery.mockReturnValue([]);
    mockCreateTodo.mockResolvedValue("new-todo-id");

    render(<Home />);

    const input = screen.getByRole("textbox", { name: /task input/i });
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        content: "New task",
        category: "General",
        priority: "medium",
        isCompleted: false,
        createdAt: expect.any(Number),
      });
    });
  });

  it("clears input after submitting a todo", async () => {
    mockUseQuery.mockReturnValue([]);
    mockCreateTodo.mockResolvedValue("new-todo-id");

    render(<Home />);

    const input = screen.getByRole("textbox", { name: /task input/i }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("calls toggleComplete mutation when toggling a todo", async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: "todo-1",
        content: "Test task",
        category: "General",
        priority: "medium",
        isCompleted: false,
        createdAt: Date.now(),
      },
    ]);
    mockToggleComplete.mockResolvedValue({ isCompleted: true });

    render(<Home />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockToggleComplete).toHaveBeenCalledWith({ id: "todo-1" });
    });
  });

  it("displays todos grouped by category", () => {
    mockUseQuery.mockReturnValue([
      {
        _id: "todo-1",
        content: "Buy milk",
        category: "Shopping",
        priority: "medium",
        isCompleted: false,
        createdAt: Date.now(),
      },
      {
        _id: "todo-2",
        content: "Finish report",
        category: "Work",
        priority: "high",
        isCompleted: false,
        createdAt: Date.now(),
      },
    ]);

    render(<Home />);

    // Check for category headers in the todo list sections
    const categoryHeaders = document.querySelectorAll("[data-slot='category-header']");
    const headerTexts = Array.from(categoryHeaders).map(h => h.textContent);
    expect(headerTexts.some(text => text?.includes("Shopping"))).toBe(true);
    expect(headerTexts.some(text => text?.includes("Work"))).toBe(true);
  });

  describe("category filter", () => {
    it("renders category filter chips for active todos", () => {
      mockUseQuery.mockReturnValue([
        {
          _id: "todo-1",
          content: "Buy milk",
          category: "Shopping",
          priority: "medium",
          isCompleted: false,
          createdAt: Date.now(),
        },
        {
          _id: "todo-2",
          content: "Finish report",
          category: "Work",
          priority: "high",
          isCompleted: false,
          createdAt: Date.now(),
        },
      ]);

      render(<Home />);

      const filterGroup = screen.getByRole("group", { name: /filter by category/i });
      expect(filterGroup).toBeInTheDocument();
    });

    it("filters todos when a category chip is clicked", () => {
      mockUseQuery.mockReturnValue([
        {
          _id: "todo-1",
          content: "Buy milk",
          category: "Shopping",
          priority: "medium",
          isCompleted: false,
          createdAt: Date.now(),
        },
        {
          _id: "todo-2",
          content: "Finish report",
          category: "Work",
          priority: "high",
          isCompleted: false,
          createdAt: Date.now(),
        },
      ]);

      render(<Home />);

      // Both todos visible initially
      expect(screen.getByText("Buy milk")).toBeInTheDocument();
      expect(screen.getByText("Finish report")).toBeInTheDocument();

      // Click on Shopping filter
      const shoppingChip = screen.getByRole("button", { name: "Shopping" });
      fireEvent.click(shoppingChip);

      // Only Shopping todo should be visible
      expect(screen.getByText("Buy milk")).toBeInTheDocument();
      expect(screen.queryByText("Finish report")).not.toBeInTheDocument();
    });

    it("shows all todos when active filter is clicked again", () => {
      mockUseQuery.mockReturnValue([
        {
          _id: "todo-1",
          content: "Buy milk",
          category: "Shopping",
          priority: "medium",
          isCompleted: false,
          createdAt: Date.now(),
        },
        {
          _id: "todo-2",
          content: "Finish report",
          category: "Work",
          priority: "high",
          isCompleted: false,
          createdAt: Date.now(),
        },
      ]);

      render(<Home />);

      // Click on Shopping filter to activate it
      const shoppingChip = screen.getByRole("button", { name: "Shopping" });
      fireEvent.click(shoppingChip);

      // Only Shopping todo visible
      expect(screen.getByText("Buy milk")).toBeInTheDocument();
      expect(screen.queryByText("Finish report")).not.toBeInTheDocument();

      // Click again to deactivate filter
      fireEvent.click(shoppingChip);

      // Both todos should be visible again
      expect(screen.getByText("Buy milk")).toBeInTheDocument();
      expect(screen.getByText("Finish report")).toBeInTheDocument();
    });

    it("does not show filter chips for categories of completed todos only", () => {
      mockUseQuery.mockReturnValue([
        {
          _id: "todo-1",
          content: "Active task",
          category: "Work",
          priority: "medium",
          isCompleted: false,
          createdAt: Date.now(),
        },
        {
          _id: "todo-2",
          content: "Completed task",
          category: "Personal",
          priority: "low",
          isCompleted: true,
          completedAt: Date.now(),
          createdAt: Date.now() - 1000,
        },
      ]);

      render(<Home />);

      // Work should have a filter chip (has active todos)
      expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
      // Personal should not have a filter chip (only completed todos)
      expect(screen.queryByRole("button", { name: "Personal" })).not.toBeInTheDocument();
    });

    it("does not render filter chips when there are no active todos", () => {
      mockUseQuery.mockReturnValue([]);

      render(<Home />);

      expect(screen.queryByRole("group", { name: /filter by category/i })).not.toBeInTheDocument();
    });
  });
});
