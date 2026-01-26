"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TodoItem } from "@/components/todo-item"
import { type Todo } from "@/components/todo-list"
import { Loader2 } from "lucide-react"

export interface ProcessingSectionProps {
  todos: Todo[]
  onToggleComplete?: (id: string, checked: boolean) => void
  onEdit?: (id: string, newContent: string) => void
  onImageClick?: (todoId: string, imageIndex: number) => void
  className?: string
}

function ProcessingSection({
  todos,
  onToggleComplete,
  onEdit,
  onImageClick,
  className,
}: ProcessingSectionProps) {
  const processingTodos = todos.filter((todo) => todo.isProcessing)

  if (processingTodos.length === 0) {
    return null
  }

  return (
    <div
      data-slot="processing-section"
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex items-center gap-2 py-2 px-1 text-sm font-medium text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>En cours de traitement...</span>
      </div>
      <ul
        data-slot="processing-todo-list"
        className="flex flex-col gap-2 pl-6"
        role="list"
      >
        {processingTodos.map((todo) => (
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
    </div>
  )
}

export { ProcessingSection }
