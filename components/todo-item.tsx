"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export type Priority = "low" | "medium" | "high"

export interface TodoItemProps {
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
  content,
  priority,
  isCompleted,
  onToggleComplete,
  className,
}: TodoItemProps) {
  return (
    <Card
      data-slot="todo-item"
      data-priority={priority}
      data-completed={isCompleted}
      className={cn(
        "flex flex-row items-center gap-3 py-3 px-4",
        isCompleted && "opacity-60",
        className
      )}
    >
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
