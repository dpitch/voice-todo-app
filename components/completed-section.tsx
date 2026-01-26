"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TodoItem } from "@/components/todo-item"
import { type Todo } from "@/components/todo-list"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export interface CompletedSectionProps {
  todos: Todo[]
  onToggleComplete?: (id: string, checked: boolean) => void
  onEdit?: (id: string, newContent: string) => void
  onImageClick?: (todoId: string, imageIndex: number) => void
  defaultOpen?: boolean
  className?: string
}

function CompletedSection({
  todos,
  onToggleComplete,
  onEdit,
  onImageClick,
  defaultOpen = false,
  className,
}: CompletedSectionProps) {
  const completedTodos = todos.filter((todo) => todo.isCompleted)
  const count = completedTodos.length

  if (count === 0) {
    return null
  }

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      data-slot="completed-section"
      className={className}
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between py-2 px-1",
          "text-sm font-medium text-foreground",
          "hover:bg-muted/50 rounded-md transition-colors",
          "group"
        )}
      >
        <span data-slot="completed-header" className="flex items-center gap-2">
          <ChevronDown
            className="size-4 transition-transform group-data-[state=closed]:-rotate-90"
            aria-hidden="true"
          />
          <span>Terminés ({count})</span>
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul
          data-slot="completed-todo-list"
          className="flex flex-col gap-2 pl-6 pt-2"
          role="list"
        >
          {completedTodos.map((todo) => (
            <li key={todo.id}>
              <TodoItem
                id={todo.id}
                content={todo.content}
                priority={todo.priority}
                isCompleted={todo.isCompleted}
                isProcessing={todo.isProcessing}
                imageUrls={todo.imageUrls}
                onImageClick={
                  onImageClick
                    ? (index) => onImageClick(todo.id, index)
                    : undefined
                }
                onToggleComplete={
                  onToggleComplete
                    ? (checked) => onToggleComplete(todo.id, checked)
                    : undefined
                }
                onEdit={
                  onEdit
                    ? (newContent) => onEdit(todo.id, newContent)
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

export { CompletedSection }
