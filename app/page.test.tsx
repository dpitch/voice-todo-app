import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./page";

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

describe("Home page", () => {
  const mockCreateTodo = jest.fn();
  const mockToggleComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockImplementation((mutationName: string) => {
      if (mutationName === "todos.create") return mockCreateTodo;
      if (mutationName === "todos.toggleComplete") return mockToggleComplete;
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

    expect(screen.getByText("Shopping")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });
});
