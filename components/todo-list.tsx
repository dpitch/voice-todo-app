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
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

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
  categoryChangedTodoId?: string | null
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
  categoryChangedTodoId?: string | null
}

function CategorySection({
  category,
  todos,
  onToggleComplete,
  defaultOpen = true,
  categoryChangedTodoId,
}: CategorySectionProps) {
  const completedCount = todos.filter((t) => t.isCompleted).length
  const totalCount = todos.length

  const todoIds = todos.map((todo) => todo.id)

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
        <SortableContext
          items={todoIds}
          strategy={verticalListSortingStrategy}
        >
          <ul
            data-slot="category-todo-list"
            className="flex flex-col gap-2 pl-6 pt-2"
            role="list"
          >
            {todos.map((todo) => (
              <li key={todo.id}>
                <TodoItem
                  id={todo.id}
                  content={todo.content}
                  priority={todo.priority}
                  isCompleted={todo.isCompleted}
                  isCategoryChanged={todo.id === categoryChangedTodoId}
                  onToggleComplete={
                    onToggleComplete
                      ? (checked) => onToggleComplete(todo.id, checked)
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </SortableContext>
      </CollapsibleContent>
    </Collapsible>
  )
}

function TodoList({ todos, onToggleComplete, className, categoryChangedTodoId }: TodoListProps) {
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
          categoryChangedTodoId={categoryChangedTodoId}
        />
      ))}
    </div>
  )
}

export { TodoList, CategorySection, groupTodosByCategory }
