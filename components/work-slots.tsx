"use client"

import * as React from "react"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { WorkSlot, type SlotTodo } from "@/components/work-slot"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"

export interface WorkSlotData {
  _id: Id<"workSlots">
  todoId?: Id<"todos">
  position: number
  row?: number
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
  onMoveToRow: (slotId: Id<"workSlots">, targetRow: number) => void
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
  onMoveToRow,
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

  const handleMoveToRow = useCallback((slotId: string) => {
    const slot = slots.find((s) => s._id === slotId)
    if (!slot) return
    const currentRow = slot.row ?? 0
    const targetRow = currentRow === 0 ? 1 : 0
    onMoveToRow(slotId as Id<"workSlots">, targetRow)
  }, [slots, onMoveToRow])

  const focusSlots = slots.filter((s) => (s.row ?? 0) === 0)
  const backburnerSlots = slots.filter((s) => (s.row ?? 0) === 1)

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

      {/* Focus row */}
      <div
        data-slot="slots-container"
        className={cn(
          "flex items-start gap-4 overflow-x-auto pb-4",
          "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        )}
      >
        {focusSlots.length === 0 && backburnerSlots.length === 0 ? (
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
          <SortableContext
            items={focusSlots.map((s) => `${idPrefix}slot-${s._id}`)}
            strategy={horizontalListSortingStrategy}
          >
            {focusSlots.map((slot) => {
              const todo = slot.todoId ? todos.get(slot.todoId) : undefined
              return (
                <WorkSlot
                  key={slot._id}
                  slotId={slot._id}
                  idPrefix={idPrefix}
                  position={slot.position}
                  row={slot.row ?? 0}
                  todo={todo}
                  notes={slot.notes}
                  onNotesChange={handleNotesChange}
                  onClear={handleClear}
                  onDelete={handleDelete}
                  onComplete={onCompleteTodo}
                  onMoveToRow={handleMoveToRow}
                />
              )
            })}
          </SortableContext>
        )}
      </div>

      {/* Backburner row */}
      {(backburnerSlots.length > 0 || focusSlots.length > 0) && (
        <>
          <div className="flex items-center gap-3 my-3">
            <div className="h-px flex-1 border-t border-dashed border-border" />
            <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
              En attente
            </span>
            <div className="h-px flex-1 border-t border-dashed border-border" />
          </div>

          <div
            data-slot="backburner-container"
            className={cn(
              "flex items-start gap-4 overflow-x-auto pb-4 opacity-60",
              "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            )}
          >
            {backburnerSlots.length === 0 ? (
              <div className="flex items-center justify-center min-h-[80px] w-full border border-dashed rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Glisse un slot ici ou utilise la flèche ↓ pour mettre en attente
                </p>
              </div>
            ) : (
              <SortableContext
                items={backburnerSlots.map((s) => `${idPrefix}slot-${s._id}`)}
                strategy={horizontalListSortingStrategy}
              >
                {backburnerSlots.map((slot) => {
                  const todo = slot.todoId ? todos.get(slot.todoId) : undefined
                  return (
                    <WorkSlot
                      key={slot._id}
                      slotId={slot._id}
                      idPrefix={idPrefix}
                      position={slot.position}
                      row={slot.row ?? 0}
                      todo={todo}
                      notes={slot.notes}
                      onNotesChange={handleNotesChange}
                      onClear={handleClear}
                      onDelete={handleDelete}
                      onComplete={onCompleteTodo}
                      onMoveToRow={handleMoveToRow}
                    />
                  )
                })}
              </SortableContext>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export { WorkSlots }
