import * as React from "react"

export const DndContext = ({
  children,
}: {
  children: React.ReactNode
  sensors?: unknown
  collisionDetection?: unknown
  onDragStart?: unknown
  onDragEnd?: unknown
}) => children

export const closestCenter = () => null
export const pointerWithin = () => null
export const KeyboardSensor = {}
export const PointerSensor = {}
export const useSensor = () => ({})
export const useSensors = () => []
export const useDraggable = () => ({
  attributes: {},
  listeners: {},
  setNodeRef: () => {},
  transform: null,
  isDragging: false,
})
export const useDroppable = () => ({
  setNodeRef: () => {},
  isOver: false,
})

export type DragEndEvent = {
  active: { id: string | number }
  over: { id: string | number } | null
}
