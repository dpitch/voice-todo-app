import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./page";

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockUseAction = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useAction: (...args: unknown[]) => mockUseAction(...args),
}));

// Mock state for useAudioRecorder
const mockAudioRecorderState = {
  recorderState: "idle" as "idle" | "recording" | "processing",
  audioBlob: null as Blob | null,
  error: null as string | null,
};
const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn();
const mockResetRecording = jest.fn();

jest.mock("../lib/useAudioRecorder", () => ({
  useAudioRecorder: () => ({
    get state() {
      return mockAudioRecorderState.recorderState;
    },
    get audioBlob() {
      return mockAudioRecorderState.audioBlob;
    },
    get error() {
      return mockAudioRecorderState.error;
    },
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
    resetRecording: mockResetRecording,
  }),
}));

// Store the captured onDragEnd handler from DndContext
let capturedOnDragEnd: ((event: unknown) => void) | null = null;

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: (event: unknown) => void }) => {
    capturedOnDragEnd = onDragEnd || null;
    return <>{children}</>;
  },
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
  const mockCreateCategory = jest.fn();
  const mockDeleteCategory = jest.fn();
  const mockGenerateUploadUrl = jest.fn();
  const mockProcessVoiceTodo = jest.fn();
  const mockProcessTextTodo = jest.fn();
  const mockProcessImageTodo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset audio recorder mock state
    mockAudioRecorderState.recorderState = "idle";
    mockAudioRecorderState.audioBlob = null;
    mockAudioRecorderState.error = null;
    
    // Set default return values for action mocks (they return promises)
    mockProcessVoiceTodo.mockReturnValue(Promise.resolve());
    mockProcessTextTodo.mockReturnValue(Promise.resolve());
    mockProcessImageTodo.mockReturnValue(Promise.resolve());
    
    mockUseMutation.mockImplementation((mutationName: string) => {
      if (mutationName === "todos.create") return mockCreateTodo;
      if (mutationName === "todos.toggleComplete") return mockToggleComplete;
      if (mutationName === "todos.updateCategory") return mockUpdateCategory;
      if (mutationName === "todos.createCategory") return mockCreateCategory;
      if (mutationName === "todos.deleteCategory") return mockDeleteCategory;
      if (mutationName === "ai.generateUploadUrl") return mockGenerateUploadUrl;
      return jest.fn();
    });
    mockUseAction.mockImplementation((actionName: string) => {
      if (actionName === "ai.processVoiceTodo") return mockProcessVoiceTodo;
      if (actionName === "ai.processTextTodo") return mockProcessTextTodo;
      if (actionName === "ai.processImageTodo") return mockProcessImageTodo;
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

  it("calls processTextTodo action when submitting a new todo", async () => {
    mockUseQuery.mockReturnValue([]);
    mockProcessTextTodo.mockReturnValue(Promise.resolve("new-todo-id"));

    render(<Home />);

    const input = screen.getByRole("textbox", { name: /task input/i });
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockProcessTextTodo).toHaveBeenCalledWith({
        content: "New task",
        existingCategories: [],
      });
    });
  });

  it("clears input after submitting a todo", async () => {
    mockUseQuery.mockReturnValue([]);
    mockProcessTextTodo.mockReturnValue(Promise.resolve("new-todo-id"));

    render(<Home />);

    const input = screen.getByRole("textbox", { name: /task input/i }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("calls toggleComplete mutation when toggling a todo (after celebration animation)", async () => {
    jest.useFakeTimers();
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

    // The callback is delayed by 1200ms for the celebration animation
    expect(mockToggleComplete).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1200);
    
    await waitFor(() => {
      expect(mockToggleComplete).toHaveBeenCalledWith({ id: "todo-1" });
    });
    
    jest.useRealTimers();
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

  describe("drag and drop to category", () => {
    beforeEach(() => {
      capturedOnDragEnd = null;
    });

    it("calls updateCategory when a todo is dropped on a different category chip", async () => {
      mockUseQuery.mockReturnValue([
        {
          _id: "todo-1",
          content: "Buy groceries",
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

      // Simulate a drag end event where todo-1 is dropped on Work category chip
      if (capturedOnDragEnd) {
        capturedOnDragEnd({
          active: { id: "todo-1" },
          over: {
            id: "category-drop-Work",
            data: { current: { type: "category", category: "Work" } },
          },
        });
      }

      await waitFor(() => {
        expect(mockUpdateCategory).toHaveBeenCalledWith({
          id: "todo-1",
          category: "Work",
        });
      });
    });

    it("does not call updateCategory when a todo is dropped on the same category", async () => {
      mockUseQuery.mockReturnValue([
        {
          _id: "todo-1",
          content: "Buy groceries",
          category: "Shopping",
          priority: "medium",
          isCompleted: false,
          createdAt: Date.now(),
        },
      ]);

      render(<Home />);

      // Simulate a drag end event where todo-1 is dropped on its own category
      if (capturedOnDragEnd) {
        capturedOnDragEnd({
          active: { id: "todo-1" },
          over: {
            id: "category-drop-Shopping",
            data: { current: { type: "category", category: "Shopping" } },
          },
        });
      }

      await waitFor(() => {
        expect(mockUpdateCategory).not.toHaveBeenCalled();
      });
    });

    it("does not call updateCategory when a todo is dropped on nothing", async () => {
      mockUseQuery.mockReturnValue([
        {
          _id: "todo-1",
          content: "Buy groceries",
          category: "Shopping",
          priority: "medium",
          isCompleted: false,
          createdAt: Date.now(),
        },
      ]);

      render(<Home />);

      // Simulate a drag end event where todo is dropped on nothing
      if (capturedOnDragEnd) {
        capturedOnDragEnd({
          active: { id: "todo-1" },
          over: null,
        });
      }

      await waitFor(() => {
        expect(mockUpdateCategory).not.toHaveBeenCalled();
      });
    });

    it("does not call updateCategory when a todo is dropped on a non-category element", async () => {
      mockUseQuery.mockReturnValue([
        {
          _id: "todo-1",
          content: "Buy groceries",
          category: "Shopping",
          priority: "medium",
          isCompleted: false,
          createdAt: Date.now(),
        },
      ]);

      render(<Home />);

      // Simulate a drag end event where todo is dropped on a non-category element
      if (capturedOnDragEnd) {
        capturedOnDragEnd({
          active: { id: "todo-1" },
          over: {
            id: "some-other-element",
            data: { current: { type: "other" } },
          },
        });
      }

      await waitFor(() => {
        expect(mockUpdateCategory).not.toHaveBeenCalled();
      });
    });
  });

  describe("voice recording integration", () => {
    it("renders voice button", () => {
      mockUseQuery.mockReturnValue([]);

      render(<Home />);

      const voiceButton = screen.getByRole("button", { name: /record/i });
      expect(voiceButton).toBeInTheDocument();
    });

    it("calls startRecording when voice button is clicked in idle state", () => {
      mockUseQuery.mockReturnValue([]);
      mockAudioRecorderState.recorderState = "idle";

      render(<Home />);

      const voiceButton = screen.getByRole("button", { name: /record/i });
      fireEvent.click(voiceButton);

      expect(mockStartRecording).toHaveBeenCalled();
    });

    it("calls stopRecording when voice button is clicked in recording state", () => {
      mockUseQuery.mockReturnValue([]);
      mockAudioRecorderState.recorderState = "recording";

      render(<Home />);

      const voiceButton = screen.getByRole("button", { name: /stop/i });
      fireEvent.click(voiceButton);

      expect(mockStopRecording).toHaveBeenCalled();
    });

    it("processes audio blob when recording stops and calls processVoiceTodo", async () => {
      mockUseQuery.mockReturnValue([]);
      mockProcessVoiceTodo.mockResolvedValue({
        todoId: "123",
        content: "Test todo",
        category: "Test",
        priority: "medium",
      });

      // Create a mock blob
      const testBlob = new Blob(["test audio data"], { type: "audio/webm" });
      mockAudioRecorderState.audioBlob = testBlob;
      mockAudioRecorderState.recorderState = "idle";

      render(<Home />);

      await waitFor(() => {
        expect(mockProcessVoiceTodo).toHaveBeenCalled();
      });

      // Verify the audio data was passed
      const callArgs = mockProcessVoiceTodo.mock.calls[0][0];
      expect(callArgs).toHaveProperty("audioData");
      expect(typeof callArgs.audioData).toBe("string");
    });

    it("resets recording after processing completes", async () => {
      mockUseQuery.mockReturnValue([]);
      mockProcessVoiceTodo.mockResolvedValue({
        todoId: "123",
        content: "Test todo",
        category: "Test",
        priority: "medium",
      });

      const testBlob = new Blob(["test audio data"], { type: "audio/webm" });
      mockAudioRecorderState.audioBlob = testBlob;
      mockAudioRecorderState.recorderState = "idle";

      render(<Home />);

      await waitFor(() => {
        expect(mockResetRecording).toHaveBeenCalled();
      });
    });

    it("handles voice processing error gracefully", async () => {
      mockUseQuery.mockReturnValue([]);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockProcessVoiceTodo.mockRejectedValue(new Error("API error"));

      const testBlob = new Blob(["test audio data"], { type: "audio/webm" });
      mockAudioRecorderState.audioBlob = testBlob;
      mockAudioRecorderState.recorderState = "idle";

      render(<Home />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Voice processing failed:",
          expect.any(Error)
        );
      });

      // Should still reset recording after error
      await waitFor(() => {
        expect(mockResetRecording).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it("does not process when audioBlob is null", () => {
      mockUseQuery.mockReturnValue([]);
      mockAudioRecorderState.audioBlob = null;
      mockAudioRecorderState.recorderState = "idle";

      render(<Home />);

      expect(mockProcessVoiceTodo).not.toHaveBeenCalled();
    });

    it("does not process when still recording", () => {
      mockUseQuery.mockReturnValue([]);
      const testBlob = new Blob(["test audio data"], { type: "audio/webm" });
      mockAudioRecorderState.audioBlob = testBlob;
      mockAudioRecorderState.recorderState = "recording";

      render(<Home />);

      expect(mockProcessVoiceTodo).not.toHaveBeenCalled();
    });
  });
});
