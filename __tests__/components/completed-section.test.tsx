import { render, screen, fireEvent } from "@testing-library/react"
import { CompletedSection } from "@/components/completed-section"
import { type Todo } from "@/components/todo-list"

const createTodo = (
  overrides: Partial<Todo> & { id: string; category: string }
): Todo => ({
  content: "Test todo",
  priority: "medium",
  isCompleted: false,
  ...overrides,
})

describe("CompletedSection component", () => {
  const completedTodos: Todo[] = [
    createTodo({ id: "1", content: "Task 1", category: "Work", isCompleted: true }),
    createTodo({ id: "2", content: "Task 2", category: "Home", isCompleted: true }),
    createTodo({ id: "3", content: "Task 3", category: "Work", isCompleted: true }),
  ]

  const mixedTodos: Todo[] = [
    createTodo({ id: "1", content: "Incomplete task", category: "Work", isCompleted: false }),
    createTodo({ id: "2", content: "Completed task", category: "Home", isCompleted: true }),
    createTodo({ id: "3", content: "Another incomplete", category: "Work", isCompleted: false }),
  ]

  describe("rendering", () => {
    it("renders the completed section container", () => {
      render(<CompletedSection todos={completedTodos} />)
      const container = document.querySelector("[data-slot='completed-section']")
      expect(container).toBeInTheDocument()
    })

    it("renders the section title with count", () => {
      render(<CompletedSection todos={completedTodos} />)
      expect(screen.getByText("Terminés (3)")).toBeInTheDocument()
    })

    it("only counts completed todos", () => {
      render(<CompletedSection todos={mixedTodos} />)
      expect(screen.getByText("Terminés (1)")).toBeInTheDocument()
    })

    it("only displays completed todos in the list", () => {
      render(<CompletedSection todos={mixedTodos} defaultOpen />)
      expect(screen.getByText("Completed task")).toBeInTheDocument()
      expect(screen.queryByText("Incomplete task")).not.toBeInTheDocument()
      expect(screen.queryByText("Another incomplete")).not.toBeInTheDocument()
    })

    it("renders all completed todos", () => {
      render(<CompletedSection todos={completedTodos} defaultOpen />)
      expect(screen.getByText("Task 1")).toBeInTheDocument()
      expect(screen.getByText("Task 2")).toBeInTheDocument()
      expect(screen.getByText("Task 3")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      render(<CompletedSection todos={completedTodos} className="custom-class" />)
      const container = document.querySelector("[data-slot='completed-section']")
      expect(container).toHaveClass("custom-class")
    })
  })

  describe("empty state", () => {
    it("returns null when no completed todos", () => {
      const incompleteTodos: Todo[] = [
        createTodo({ id: "1", content: "Task 1", category: "Work", isCompleted: false }),
        createTodo({ id: "2", content: "Task 2", category: "Home", isCompleted: false }),
      ]
      const { container } = render(<CompletedSection todos={incompleteTodos} />)
      expect(container).toBeEmptyDOMElement()
    })

    it("returns null when todos array is empty", () => {
      const { container } = render(<CompletedSection todos={[]} />)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe("collapsible behavior", () => {
    it("is collapsed by default", () => {
      render(<CompletedSection todos={completedTodos} />)
      const content = document.querySelector("[data-slot='collapsible-content']")
      expect(content).toHaveAttribute("data-state", "closed")
    })

    it("can be expanded when trigger is clicked", () => {
      render(<CompletedSection todos={completedTodos} />)
      const trigger = screen.getByRole("button")
      fireEvent.click(trigger)

      const content = document.querySelector("[data-slot='collapsible-content']")
      expect(content).toHaveAttribute("data-state", "open")
    })

    it("starts expanded when defaultOpen is true", () => {
      render(<CompletedSection todos={completedTodos} defaultOpen />)
      const content = document.querySelector("[data-slot='collapsible-content']")
      expect(content).toHaveAttribute("data-state", "open")
    })
  })

  describe("accessibility", () => {
    it("renders a list with role='list'", () => {
      render(<CompletedSection todos={completedTodos} defaultOpen />)
      const list = screen.getByRole("list")
      expect(list).toBeInTheDocument()
    })

    it("has completed-header data-slot", () => {
      render(<CompletedSection todos={completedTodos} />)
      const header = document.querySelector("[data-slot='completed-header']")
      expect(header).toBeInTheDocument()
    })

    it("has completed-todo-list data-slot", () => {
      render(<CompletedSection todos={completedTodos} defaultOpen />)
      const list = document.querySelector("[data-slot='completed-todo-list']")
      expect(list).toBeInTheDocument()
    })
  })

  describe("toggle complete functionality", () => {
    it("calls onToggleComplete with correct id when todo is toggled", () => {
      const handleToggle = jest.fn()
      render(
        <CompletedSection
          todos={completedTodos}
          onToggleComplete={handleToggle}
          defaultOpen
        />
      )

      const checkbox = screen.getByRole("checkbox", {
        name: /mark "task 1" as incomplete/i,
      })
      fireEvent.click(checkbox)

      expect(handleToggle).toHaveBeenCalledWith("1", false)
    })

    it("does not call onToggleComplete when not provided", () => {
      render(<CompletedSection todos={completedTodos} defaultOpen />)

      const checkbox = screen.getByRole("checkbox", {
        name: /mark "task 1" as incomplete/i,
      })

      expect(() => fireEvent.click(checkbox)).not.toThrow()
    })
  })
})
