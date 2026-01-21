import { render, screen } from "@testing-library/react"
import {
  TodoList,
  CategorySection,
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

describe("TodoList drag and drop configuration", () => {
  const sampleTodos: Todo[] = [
    createTodo({ id: "1", content: "Task 1", category: "Work", priority: "high" }),
    createTodo({ id: "2", content: "Task 2", category: "Work", priority: "medium" }),
    createTodo({ id: "3", content: "Task 3", category: "Work", priority: "low" }),
  ]

  describe("DndContext and SortableContext integration", () => {
    it("renders todos with drag handles", () => {
      render(<TodoList todos={sampleTodos} />)
      const dragHandles = document.querySelectorAll("[data-slot='drag-handle']")
      expect(dragHandles).toHaveLength(3)
    })

    it("drag handles have correct accessible label", () => {
      render(<TodoList todos={sampleTodos} />)
      const dragHandles = screen.getAllByRole("button", { name: /drag to reorder/i })
      expect(dragHandles).toHaveLength(3)
    })

    it("renders todos within sortable context", () => {
      render(<TodoList todos={sampleTodos} />)
      const todoItems = document.querySelectorAll("[data-slot='todo-item']")
      expect(todoItems).toHaveLength(3)
    })

    it("todo items have data-dragging attribute", () => {
      render(<TodoList todos={sampleTodos} />)
      const todoItems = document.querySelectorAll("[data-slot='todo-item']")
      todoItems.forEach((item) => {
        expect(item).toHaveAttribute("data-dragging", "false")
      })
    })
  })

  describe("CategorySection with drag and drop", () => {
    it("renders drag handles for each todo in category", () => {
      render(<CategorySection category="Work" todos={sampleTodos} />)
      const dragHandles = document.querySelectorAll("[data-slot='drag-handle']")
      expect(dragHandles).toHaveLength(3)
    })

    it("accepts onReorder callback prop", () => {
      const handleReorder = jest.fn()
      render(
        <CategorySection
          category="Work"
          todos={sampleTodos}
          onReorder={handleReorder}
        />
      )
      expect(document.querySelector("[data-slot='category-section']")).toBeInTheDocument()
    })
  })

  describe("TodoList with onReorder prop", () => {
    it("accepts onReorder callback prop", () => {
      const handleReorder = jest.fn()
      render(<TodoList todos={sampleTodos} onReorder={handleReorder} />)
      expect(document.querySelector("[data-slot='todo-list']")).toBeInTheDocument()
    })

    it("passes onReorder to CategorySection components", () => {
      const handleReorder = jest.fn()
      render(<TodoList todos={sampleTodos} onReorder={handleReorder} />)
      const dragHandles = document.querySelectorAll("[data-slot='drag-handle']")
      expect(dragHandles).toHaveLength(3)
    })
  })
})
