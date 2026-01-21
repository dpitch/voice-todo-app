"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"

export interface CategoryFiltersProps {
  categories: string[]
  activeCategory?: string | null
  onCategoryChange?: (category: string | null) => void
  className?: string
}

interface CategoryChipProps {
  category: string
  isActive: boolean
  onClick: () => void
}

function CategoryChip({ category, isActive, onClick }: CategoryChipProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `category-drop-${category}`,
    data: {
      type: "category",
      category,
    },
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      data-slot="category-chip"
      data-active={isActive}
      data-category={category}
      data-drag-over={isOver}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1",
        "text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        isOver && "ring-2 ring-primary ring-offset-2 bg-primary/20"
      )}
      aria-pressed={isActive}
    >
      {category}
    </button>
  )
}

function CategoryFilters({
  categories,
  activeCategory = null,
  onCategoryChange,
  className,
}: CategoryFiltersProps) {
  const handleChipClick = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(activeCategory === category ? null : category)
    }
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div
      data-slot="category-filters"
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label="Filter by category"
    >
      {categories.map((category) => {
        const isActive = activeCategory === category
        return (
          <CategoryChip
            key={category}
            category={category}
            isActive={isActive}
            onClick={() => handleChipClick(category)}
          />
        )
      })}
    </div>
  )
}

export { CategoryFilters }
