import { render, screen } from "@testing-library/react"
import {
  TodoList,
  CategorySection,
  type Todo,
} from "@/components/todo-list"
import { DndContext } from "@dnd-kit/core"

const createTodo = (
  overrides: Partial<Todo> & { id: string; category: string }
): Todo => ({
  content: "Test todo",
  priority: "medium",
  isCompleted: false,
  ...overrides,
})

const renderWithDndContext = (ui: React.ReactElement) => {
  return render(<DndContext>{ui}</DndContext>)
}

describe("TodoList drag and drop configuration", () => {
  const sampleTodos: Todo[] = [
    createTodo({ id: "1", content: "Task 1", category: "Work", priority: "high" }),
    createTodo({ id: "2", content: "Task 2", category: "Work", priority: "medium" }),
    createTodo({ id: "3", content: "Task 3", category: "Work", priority: "low" }),
  ]

  describe("DndContext and SortableContext integration", () => {
    it("renders todos with drag handles", () => {
      renderWithDndContext(<TodoList todos={sampleTodos} />)
      const dragHandles = document.querySelectorAll("[data-slot='drag-handle']")
      expect(dragHandles).toHaveLength(3)
    })

    it("drag handles have correct accessible label", () => {
      renderWithDndContext(<TodoList todos={sampleTodos} />)
      const dragHandles = screen.getAllByRole("button", { name: /drag to reorder/i })
      expect(dragHandles).toHaveLength(3)
    })

    it("renders todos within sortable context", () => {
      renderWithDndContext(<TodoList todos={sampleTodos} />)
      const todoItems = document.querySelectorAll("[data-slot='todo-item']")
      expect(todoItems).toHaveLength(3)
    })

    it("todo items have data-dragging attribute", () => {
      renderWithDndContext(<TodoList todos={sampleTodos} />)
      const todoItems = document.querySelectorAll("[data-slot='todo-item']")
      todoItems.forEach((item) => {
        expect(item).toHaveAttribute("data-dragging", "false")
      })
    })
  })

  describe("CategorySection with drag and drop", () => {
    it("renders drag handles for each todo in category", () => {
      renderWithDndContext(<CategorySection category="Work" todos={sampleTodos} />)
      const dragHandles = document.querySelectorAll("[data-slot='drag-handle']")
      expect(dragHandles).toHaveLength(3)
    })

    it("renders todos in a sortable list", () => {
      renderWithDndContext(<CategorySection category="Work" todos={sampleTodos} />)
      expect(document.querySelector("[data-slot='category-section']")).toBeInTheDocument()
    })
  })

  describe("TodoList renders sortable todo items", () => {
    it("renders todo list with sortable items", () => {
      renderWithDndContext(<TodoList todos={sampleTodos} />)
      expect(document.querySelector("[data-slot='todo-list']")).toBeInTheDocument()
    })

    it("renders all drag handles for todos", () => {
      renderWithDndContext(<TodoList todos={sampleTodos} />)
      const dragHandles = document.querySelectorAll("[data-slot='drag-handle']")
      expect(dragHandles).toHaveLength(3)
    })
  })
})
