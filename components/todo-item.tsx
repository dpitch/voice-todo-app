"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

export type Priority = "low" | "medium" | "high"

export interface TodoItemProps {
  id: string
  content: string
  priority: Priority
  isCompleted: boolean
  onToggleComplete?: (checked: boolean) => void
  className?: string
}

const priorityColors: Record<Priority, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
}

function TodoItem({
  id,
  content,
  priority,
  isCompleted,
  onToggleComplete,
  className,
}: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "todo",
      todoId: id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-slot="todo-item"
      data-priority={priority}
      data-completed={isCompleted}
      data-dragging={isDragging}
      className={cn(
        "flex flex-row items-center gap-3 py-3 px-4",
        isCompleted && "opacity-60",
        isDragging && "opacity-50 shadow-lg",
        className
      )}
    >
      <button
        type="button"
        data-slot="drag-handle"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span
        data-slot="priority-dot"
        className={cn(
          "size-3 shrink-0 rounded-full",
          priorityColors[priority]
        )}
        aria-label={`${priority} priority`}
      />
      <span
        data-slot="todo-content"
        className={cn(
          "flex-1 text-sm",
          isCompleted && "line-through text-muted-foreground"
        )}
      >
        {content}
      </span>
      <Checkbox
        checked={isCompleted}
        onCheckedChange={onToggleComplete}
        aria-label={`Mark "${content}" as ${isCompleted ? "incomplete" : "complete"}`}
      />
    </Card>
  )
}

export { TodoItem }
