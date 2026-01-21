"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TodoItem, type Priority } from "@/components/todo-item"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export interface Todo {
  id: string
  content: string
  priority: Priority
  isCompleted: boolean
  category: string
}

export interface TodoListProps {
  todos: Todo[]
  onToggleComplete?: (id: string, checked: boolean) => void
  className?: string
}

function groupTodosByCategory(todos: Todo[]): Map<string, Todo[]> {
  const grouped = new Map<string, Todo[]>()
  for (const todo of todos) {
    const existing = grouped.get(todo.category) ?? []
    grouped.set(todo.category, [...existing, todo])
  }
  return grouped
}

interface CategorySectionProps {
  category: string
  todos: Todo[]
  onToggleComplete?: (id: string, checked: boolean) => void
  defaultOpen?: boolean
}

function CategorySection({
  category,
  todos,
  onToggleComplete,
  defaultOpen = true,
}: CategorySectionProps) {
  const completedCount = todos.filter((t) => t.isCompleted).length
  const totalCount = todos.length

  return (
    <Collapsible defaultOpen={defaultOpen} data-slot="category-section">
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between py-2 px-1",
          "text-sm font-medium text-foreground",
          "hover:bg-muted/50 rounded-md transition-colors",
          "group"
        )}
      >
        <span data-slot="category-header" className="flex items-center gap-2">
          <ChevronDown
            className="size-4 transition-transform group-data-[state=closed]:-rotate-90"
            aria-hidden="true"
          />
          <span>{category}</span>
          <span
            data-slot="category-count"
            className="text-xs text-muted-foreground"
          >
            ({completedCount}/{totalCount})
          </span>
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul
          data-slot="category-todo-list"
          className="flex flex-col gap-2 pl-6 pt-2"
          role="list"
        >
          {todos.map((todo) => (
            <li key={todo.id}>
              <TodoItem
                content={todo.content}
                priority={todo.priority}
                isCompleted={todo.isCompleted}
                onToggleComplete={
                  onToggleComplete
                    ? (checked) => onToggleComplete(todo.id, checked)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

function TodoList({ todos, onToggleComplete, className }: TodoListProps) {
  const groupedTodos = groupTodosByCategory(todos)
  const categories = Array.from(groupedTodos.keys()).sort()

  if (todos.length === 0) {
    return (
      <div
        data-slot="todo-list-empty"
        className={cn(
          "flex items-center justify-center py-8 text-sm text-muted-foreground",
          className
        )}
      >
        No todos yet
      </div>
    )
  }

  return (
    <div data-slot="todo-list" className={cn("flex flex-col gap-4", className)}>
      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          todos={groupedTodos.get(category)!}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  )
}

export { TodoList, CategorySection, groupTodosByCategory }
