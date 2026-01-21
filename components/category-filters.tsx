"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CategoryFiltersProps {
  categories: string[]
  activeCategory?: string | null
  onCategoryChange?: (category: string | null) => void
  className?: string
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
          <button
            key={category}
            type="button"
            data-slot="category-chip"
            data-active={isActive}
            onClick={() => handleChipClick(category)}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1",
              "text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-pressed={isActive}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}

export { CategoryFilters }
