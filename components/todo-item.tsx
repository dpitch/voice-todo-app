"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2 } from "lucide-react"

export type Priority = "low" | "medium" | "high"

export interface TodoItemProps {
  id: string
  content: string
  priority: Priority
  isCompleted: boolean
  isCategoryChanged?: boolean
  isProcessing?: boolean
  onToggleComplete?: (checked: boolean) => void
  onEdit?: (newContent: string) => void
  imageUrls?: string[]
  onImageClick?: (index: number) => void
  className?: string
}

const priorityColors: Record<Priority, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
}

// Confetti celebration component
function CompletionCelebration({ isActive }: { isActive: boolean }) {
  if (!isActive) return null

  return (
    <div className="confetti-container">
      {/* Confetti particles */}
      <div className="confetti-particle" />
      <div className="confetti-particle" />
      <div className="confetti-particle" />
      <div className="confetti-particle" />
      <div className="confetti-particle" />
      <div className="confetti-particle" />
      <div className="confetti-particle" />
      <div className="confetti-particle" />
      {/* Sparkle stars */}
      <div className="sparkle-star" />
      <div className="sparkle-star" />
      <div className="sparkle-star" />
    </div>
  )
}

function TodoItem({
  id,
  content,
  priority,
  isCompleted,
  isCategoryChanged,
  isProcessing,
  onToggleComplete,
  onEdit,
  imageUrls,
  onImageClick,
  className,
}: TodoItemProps) {
  // Track if we're celebrating a completion
  const [isCelebrating, setIsCelebrating] = useState(false)
  
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(content)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])
  
  // Update editValue when content changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(content)
    }
  }, [content, isEditing])
  
  // Handle starting edit mode
  const handleStartEditing = () => {
    // Don't allow editing for completed or processing todos
    if (isCompleted || isProcessing) return
    setEditValue(content)
    setIsEditing(true)
  }
  
  // Handle saving the edit
  const handleSaveEdit = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== content) {
      onEdit?.(trimmedValue)
    }
    setIsEditing(false)
  }
  
  // Handle canceling the edit
  const handleCancelEdit = () => {
    setEditValue(content)
    setIsEditing(false)
  }
  
  // Handle keyboard events in edit mode
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancelEdit()
    }
  }
  
  // Handle checkbox change with celebration animation
  const handleCheckboxChange = (checked: boolean) => {
    if (checked && !isCompleted) {
      // Starting a completion - trigger celebration!
      setIsCelebrating(true)
      
      // Delay the actual state change to let animation play fully
      setTimeout(() => {
        onToggleComplete?.(checked)
      }, 1200) // Let animation play for 1200ms before moving to completed section
    } else {
      // Unchecking - no celebration, immediate change
      onToggleComplete?.(checked)
    }
  }

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
      data-category-changed={isCategoryChanged ?? false}
      data-processing={isProcessing ?? false}
      className={cn(
        "flex flex-row items-center gap-3 py-3 px-4",
        isCompleted && "opacity-60",
        isDragging && "opacity-50 shadow-lg",
        isCategoryChanged && "animate-category-change",
        isProcessing && "animate-processing-shimmer",
        isCelebrating && "animate-completion-flash",
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
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          data-slot="todo-content-input"
          className="flex-1 text-sm bg-transparent border-b border-primary outline-none py-0.5"
          aria-label="Edit todo content"
        />
      ) : (
        <span
          data-slot="todo-content"
          onClick={handleStartEditing}
          className={cn(
            "flex-1 text-sm flex items-center gap-2",
            isCompleted && "line-through text-muted-foreground",
            isProcessing && "text-muted-foreground",
            !isCompleted && !isProcessing && "cursor-text hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
          )}
        >
          {isProcessing && (
            <Loader2 className="size-4 animate-spin shrink-0" />
          )}
          {content}
        </span>
      )}
      {imageUrls && imageUrls.length > 0 && (
        <div data-slot="image-thumbnails" className="flex gap-1">
          {imageUrls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => onImageClick?.(index)}
              className="size-8 shrink-0 overflow-hidden rounded border border-border hover:border-primary transition-colors"
            >
              <img
                src={url}
                alt={`Attached image ${index + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <div className="relative">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleCheckboxChange}
          aria-label={`Mark "${content}" as ${isCompleted ? "incomplete" : "complete"}`}
          className={cn(isCelebrating && "checkbox-completing")}
        />
        <CompletionCelebration isActive={isCelebrating} />
      </div>
    </Card>
  )
}

export { TodoItem }
