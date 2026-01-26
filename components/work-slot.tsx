"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AiSuggestion } from "@/components/ai-suggestion"
import { useDroppable } from "@dnd-kit/core"
import { X, GripVertical, Check, Trash2 } from "lucide-react"
import { type Priority } from "@/components/todo-item"

export interface SlotTodo {
  id: string
  content: string
  priority: Priority
  category: string
}

export interface WorkSlotProps {
  slotId: string
  idPrefix?: string // Pour différencier desktop/mobile
  position: number
  todo?: SlotTodo
  notes: string
  onNotesChange: (slotId: string, notes: string) => void
  onClear: (slotId: string) => void
  onDelete: (slotId: string) => void
  onComplete?: (todoId: string) => void
  className?: string
}

const priorityColors: Record<Priority, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
}

function WorkSlot({
  slotId,
  idPrefix = "",
  position,
  todo,
  notes,
  onNotesChange,
  onClear,
  onDelete,
  onComplete,
  className,
}: WorkSlotProps) {
  const [localNotes, setLocalNotes] = useState(notes)
  
  // Sync local notes with prop when it changes externally
  React.useEffect(() => {
    setLocalNotes(notes)
  }, [notes])

  const droppableId = `${idPrefix}slot-${slotId}`;
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: {
      type: "workSlot",
      slotId,
      position,
    },
  })

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setLocalNotes(newNotes)
    onNotesChange(slotId, newNotes)
  }, [slotId, onNotesChange])

  const handleClear = useCallback(() => {
    onClear(slotId)
  }, [slotId, onClear])

  const handleDelete = useCallback(() => {
    onDelete(slotId)
  }, [slotId, onDelete])

  const handleComplete = useCallback(() => {
    if (todo && onComplete) {
      onComplete(todo.id)
    }
  }, [todo, onComplete])

  return (
    <Card
      ref={setNodeRef}
      data-slot="work-slot"
      data-has-todo={!!todo}
      data-is-over={isOver}
      className={cn(
        "flex flex-col min-w-[364px] max-w-[416px] w-full",
        "transition-all duration-200",
        isOver && "ring-2 ring-primary ring-offset-2",
        !todo && "border-dashed bg-transparent",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <GripVertical className="size-4 text-muted-foreground cursor-grab" />
          <span className="text-xs font-medium text-muted-foreground">
            Slot {position + 1}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {todo && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleClear}
              title="Vider le slot"
            >
              <X className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Supprimer le slot"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col gap-3">
        {todo ? (
          <>
            {/* Todo card */}
            <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full mt-1.5",
                  priorityColors[todo.priority]
                )}
              />
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="mb-1 text-[10px] h-5">
                  {todo.category}
                </Badge>
                <p className="text-sm leading-tight">{todo.content}</p>
              </div>
            </div>

            {/* Notes textarea */}
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-medium text-muted-foreground mb-1">
                Notes
              </label>
              <textarea
                value={localNotes}
                onChange={handleNotesChange}
                placeholder="Prends des notes pendant que tu travailles..."
                className={cn(
                  "flex-1 min-h-[100px] w-full rounded-md",
                  "bg-background border border-input",
                  "px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "resize-none"
                )}
              />
            </div>

            {/* AI Suggestion */}
            <AiSuggestion
              todoContent={todo.content}
              todoCategory={todo.category}
              currentNotes={localNotes}
            />

            {/* Complete button */}
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={handleComplete}
            >
              <Check className="size-4 mr-2" />
              Terminer
            </Button>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-muted-foreground text-center">
              Glisse un to-do ici
              <br />
              pour commencer à travailler
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export { WorkSlot }
