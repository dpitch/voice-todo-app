import { render, screen, fireEvent } from "@testing-library/react"
import {
  TodoList,
  CategorySection,
  groupTodosByCategory,
  type Todo,
} from "@/components/todo-list"

const createTodo = (
  overrides: Partial<Todo> & { id: string; category: string }
): Todo => ({
  content: "Test todo",
  priority: "medium",
  isCompleted: false,
  ...overrides,
})

describe("TodoList component", () => {
  const sampleTodos: Todo[] = [
    createTodo({ id: "1", content: "Buy milk", category: "Shopping", priority: "high" }),
    createTodo({ id: "2", content: "Buy bread", category: "Shopping", priority: "medium" }),
    createTodo({ id: "3", content: "Clean room", category: "Home", priority: "low" }),
    createTodo({ id: "4", content: "Do laundry", category: "Home", priority: "medium", isCompleted: true }),
    createTodo({ id: "5", content: "Finish report", category: "Work", priority: "high" }),
  ]

  describe("rendering", () => {
    it("renders the todo list container", () => {
      render(<TodoList todos={sampleTodos} />)
      const container = document.querySelector("[data-slot='todo-list']")
      expect(container).toBeInTheDocument()
    })

    it("renders all category sections", () => {
      render(<TodoList todos={sampleTodos} />)
      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(screen.getByText("Shopping")).toBeInTheDocument()
      expect(screen.getByText("Work")).toBeInTheDocument()
    })

    it("renders todos within their categories", () => {
      render(<TodoList todos={sampleTodos} />)
      expect(screen.getByText("Buy milk")).toBeInTheDocument()
      expect(screen.getByText("Buy bread")).toBeInTheDocument()
      expect(screen.getByText("Clean room")).toBeInTheDocument()
      expect(screen.getByText("Do laundry")).toBeInTheDocument()
      expect(screen.getByText("Finish report")).toBeInTheDocument()
    })

    it("sorts categories alphabetically", () => {
      render(<TodoList todos={sampleTodos} />)
      const sections = document.querySelectorAll("[data-slot='category-section']")
      const categoryNames = Array.from(sections).map(
        (section) => section.querySelector("[data-slot='category-header']")?.textContent
      )
      expect(categoryNames[0]).toContain("Home")
      expect(categoryNames[1]).toContain("Shopping")
      expect(categoryNames[2]).toContain("Work")
    })

    it("applies custom className", () => {
      render(<TodoList todos={sampleTodos} className="custom-class" />)
      const container = document.querySelector("[data-slot='todo-list']")
      expect(container).toHaveClass("custom-class")
    })
  })

  describe("empty state", () => {
    it("renders empty state when no todos", () => {
      render(<TodoList todos={[]} />)
      expect(screen.getByText("No todos yet")).toBeInTheDocument()
    })

    it("renders empty state container with data-slot", () => {
      render(<TodoList todos={[]} />)
      const emptyContainer = document.querySelector("[data-slot='todo-list-empty']")
      expect(emptyContainer).toBeInTheDocument()
    })

    it("applies custom className to empty state", () => {
      render(<TodoList todos={[]} className="custom-empty-class" />)
      const emptyContainer = document.querySelector("[data-slot='todo-list-empty']")
      expect(emptyContainer).toHaveClass("custom-empty-class")
    })
  })

  describe("toggle complete functionality", () => {
    it("calls onToggleComplete with correct id when todo is toggled", () => {
      const handleToggle = jest.fn()
      render(<TodoList todos={sampleTodos} onToggleComplete={handleToggle} />)

      const checkbox = screen.getByRole("checkbox", {
        name: /mark "buy milk" as complete/i,
      })
      fireEvent.click(checkbox)

      expect(handleToggle).toHaveBeenCalledWith("1", true)
    })

    it("calls onToggleComplete with false when completed todo is toggled", () => {
      const handleToggle = jest.fn()
      render(<TodoList todos={sampleTodos} onToggleComplete={handleToggle} />)

      const checkbox = screen.getByRole("checkbox", {
        name: /mark "do laundry" as incomplete/i,
      })
      fireEvent.click(checkbox)

      expect(handleToggle).toHaveBeenCalledWith("4", false)
    })
  })
})

describe("CategorySection component", () => {
  const categoryTodos: Todo[] = [
    createTodo({ id: "1", content: "Task 1", category: "Work", isCompleted: false }),
    createTodo({ id: "2", content: "Task 2", category: "Work", isCompleted: true }),
    createTodo({ id: "3", content: "Task 3", category: "Work", isCompleted: true }),
  ]

  it("renders the category name", () => {
    render(<CategorySection category="Work" todos={categoryTodos} />)
    expect(screen.getByText("Work")).toBeInTheDocument()
  })

  it("renders the completion count", () => {
    render(<CategorySection category="Work" todos={categoryTodos} />)
    expect(screen.getByText("(2/3)")).toBeInTheDocument()
  })

  it("renders all todos in the category", () => {
    render(<CategorySection category="Work" todos={categoryTodos} />)
    expect(screen.getByText("Task 1")).toBeInTheDocument()
    expect(screen.getByText("Task 2")).toBeInTheDocument()
    expect(screen.getByText("Task 3")).toBeInTheDocument()
  })

  it("is expanded by default", () => {
    render(<CategorySection category="Work" todos={categoryTodos} />)
    const content = document.querySelector("[data-slot='collapsible-content']")
    expect(content).toBeVisible()
  })

  it("can be collapsed when trigger is clicked", () => {
    render(<CategorySection category="Work" todos={categoryTodos} />)
    const trigger = document.querySelector("[data-slot='collapsible-trigger']") as HTMLElement
    fireEvent.click(trigger)

    const content = document.querySelector("[data-slot='collapsible-content']")
    expect(content).toHaveAttribute("data-state", "closed")
  })

  it("starts collapsed when defaultOpen is false", () => {
    render(<CategorySection category="Work" todos={categoryTodos} defaultOpen={false} />)
    const content = document.querySelector("[data-slot='collapsible-content']")
    expect(content).toHaveAttribute("data-state", "closed")
  })

  it("renders a list with role='list'", () => {
    render(<CategorySection category="Work" todos={categoryTodos} />)
    const list = screen.getByRole("list")
    expect(list).toBeInTheDocument()
  })

  it("calls onToggleComplete when a todo is toggled", () => {
    const handleToggle = jest.fn()
    render(
      <CategorySection
        category="Work"
        todos={categoryTodos}
        onToggleComplete={handleToggle}
      />
    )

    const checkbox = screen.getByRole("checkbox", {
      name: /mark "task 1" as complete/i,
    })
    fireEvent.click(checkbox)

    expect(handleToggle).toHaveBeenCalledWith("1", true)
  })
})

describe("groupTodosByCategory", () => {
  it("groups todos by category", () => {
    const todos: Todo[] = [
      createTodo({ id: "1", category: "A" }),
      createTodo({ id: "2", category: "B" }),
      createTodo({ id: "3", category: "A" }),
    ]

    const grouped = groupTodosByCategory(todos)

    expect(grouped.get("A")).toHaveLength(2)
    expect(grouped.get("B")).toHaveLength(1)
  })

  it("returns empty map for empty array", () => {
    const grouped = groupTodosByCategory([])
    expect(grouped.size).toBe(0)
  })

  it("preserves todo data in groups", () => {
    const todo: Todo = createTodo({
      id: "1",
      content: "Test",
      category: "Test Category",
      priority: "high",
      isCompleted: true,
    })

    const grouped = groupTodosByCategory([todo])
    const groupedTodo = grouped.get("Test Category")?.[0]

    expect(groupedTodo).toEqual(todo)
  })

  it("maintains insertion order within categories", () => {
    const todos: Todo[] = [
      createTodo({ id: "1", content: "First", category: "A" }),
      createTodo({ id: "2", content: "Second", category: "A" }),
      createTodo({ id: "3", content: "Third", category: "A" }),
    ]

    const grouped = groupTodosByCategory(todos)
    const categoryTodos = grouped.get("A")!

    expect(categoryTodos[0].content).toBe("First")
    expect(categoryTodos[1].content).toBe("Second")
    expect(categoryTodos[2].content).toBe("Third")
  })
})
