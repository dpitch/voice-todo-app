"use client"

import * as React from "react"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { WorkSlot, type SlotTodo } from "@/components/work-slot"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

export interface WorkSlotData {
  _id: Id<"workSlots">
  todoId?: Id<"todos">
  position: number
  notes: string
  createdAt: number
  updatedAt: number
}

export interface WorkSlotsProps {
  slots: WorkSlotData[]
  todos: Map<string, SlotTodo>
  onCreateSlot: () => void
  onUpdateNotes: (slotId: Id<"workSlots">, notes: string) => void
  onClearSlot: (slotId: Id<"workSlots">) => void
  onDeleteSlot: (slotId: Id<"workSlots">) => void
  onCompleteTodo: (todoId: string) => void
  idPrefix?: string // Pour différencier desktop/mobile
  className?: string
}

function WorkSlots({
  slots,
  todos,
  onCreateSlot,
  onUpdateNotes,
  onClearSlot,
  onDeleteSlot,
  onCompleteTodo,
  idPrefix = "",
  className,
}: WorkSlotsProps) {
  const handleNotesChange = useCallback((slotId: string, notes: string) => {
    onUpdateNotes(slotId as Id<"workSlots">, notes)
  }, [onUpdateNotes])

  const handleClear = useCallback((slotId: string) => {
    onClearSlot(slotId as Id<"workSlots">)
  }, [onClearSlot])

  const handleDelete = useCallback((slotId: string) => {
    onDeleteSlot(slotId as Id<"workSlots">)
  }, [onDeleteSlot])

  return (
    <div
      data-slot="work-slots"
      className={cn("flex flex-col h-full", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Slots de travail</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateSlot}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Ajouter un slot
        </Button>
      </div>

      {/* Slots container */}
      <div
        data-slot="slots-container"
        className={cn(
          "flex-1 flex items-start gap-4 overflow-x-auto pb-4",
          "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        )}
      >
        {slots.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px] border border-dashed rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-3">
                Aucun slot de travail
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateSlot}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Créer ton premier slot
              </Button>
            </div>
          </div>
        ) : (
          slots.map((slot) => {
            const todo = slot.todoId ? todos.get(slot.todoId) : undefined
            return (
              <WorkSlot
                key={slot._id}
                slotId={slot._id}
                idPrefix={idPrefix}
                position={slot.position}
                todo={todo}
                notes={slot.notes}
                onNotesChange={handleNotesChange}
                onClear={handleClear}
                onDelete={handleDelete}
                onComplete={onCompleteTodo}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export { WorkSlots }
