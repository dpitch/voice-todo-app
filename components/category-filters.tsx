"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCategoryColor } from "@/lib/category-colors"

export interface CategoryFiltersProps {
  categories: string[]
  activeCategories?: string[]
  onCategoryChange?: (categories: string[]) => void
  onAddCategory?: (name: string) => void
  onDeleteCategory?: (name: string) => void
  className?: string
}

interface CategoryChipProps {
  category: string
  index: number
  isActive: boolean
  onClick: (event: React.MouseEvent) => void
  onDelete?: () => void
  showDelete?: boolean
}

function CategoryChip({ category, index, isActive, onClick, onDelete, showDelete }: CategoryChipProps) {
  const color = getCategoryColor(index)
  const { isOver, setNodeRef } = useDroppable({
    id: `category-drop-${category}`,
    data: {
      type: "category",
      category,
    },
  })

  return (
    <div className="relative group">
      <button
        ref={setNodeRef}
        type="button"
        data-slot="category-chip"
        data-active={isActive}
        data-category={category}
        data-drag-over={isOver}
        onClick={(e) => onClick(e)}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1",
          "text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isOver && "ring-2 ring-primary ring-offset-2",
          showDelete && "pr-7"
        )}
        style={{
          backgroundColor: isActive ? color : `${color}30`,
          color: isActive ? "white" : `${color}`,
        }}
        aria-pressed={isActive}
      >
        {category}
      </button>
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2",
            "rounded-full p-0.5",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
          )}
          aria-label={`Delete ${category} category`}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}

function CategoryFilters({
  categories,
  activeCategories = [],
  onCategoryChange,
  onAddCategory,
  onDeleteCategory,
  className,
}: CategoryFiltersProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)

  const handleChipClick = (category: string, event: React.MouseEvent) => {
    if (isEditMode) return
    if (onCategoryChange) {
      const isMultiSelect = event.metaKey // Cmd on Mac

      if (isMultiSelect) {
        // Multi-select: toggle in the list
        if (activeCategories.includes(category)) {
          onCategoryChange(activeCategories.filter((c) => c !== category))
        } else {
          onCategoryChange([...activeCategories, category])
        }
      } else {
        // Simple click: select only this theme (or deselect if already the only active)
        if (activeCategories.length === 1 && activeCategories[0] === category) {
          onCategoryChange([])
        } else {
          onCategoryChange([category])
        }
      }
    }
  }

  const handleAddSubmit = () => {
    if (newCategoryName.trim() && onAddCategory) {
      onAddCategory(newCategoryName.trim())
      setNewCategoryName("")
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSubmit()
    } else if (e.key === "Escape") {
      setIsAdding(false)
      setNewCategoryName("")
    }
  }

  return (
    <div
      data-slot="category-filters"
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Thèmes</span>
        <div className="flex items-center gap-1">
          {categories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="h-7 px-2 text-xs"
            >
              {isEditMode ? "Terminé" : "Gérer"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 px-2"
            aria-label="Add category"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nom du thème..."
            className="h-8 text-sm"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddSubmit}
            disabled={!newCategoryName.trim()}
            className="h-8"
          >
            Ajouter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false)
              setNewCategoryName("")
            }}
            className="h-8"
          >
            Annuler
          </Button>
        </div>
      )}

      {categories.length === 0 && !isAdding ? (
        <p className="text-sm text-muted-foreground">
          Aucun thème. Ajoutez un todo et l'IA créera automatiquement des thèmes.
        </p>
      ) : (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by category"
        >
          {activeCategories.length > 0 && (
            <button
              key="clear-filters"
              type="button"
              onClick={() => onCategoryChange?.([])}
              className={cn(
                "inline-flex items-center justify-center rounded-full p-1.5",
                "text-sm transition-colors",
                "bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
              )}
              aria-label="Effacer tous les filtres"
            >
              <X className="size-3.5" />
            </button>
          )}
          {categories.map((category, index) => {
            const isActive = activeCategories.includes(category)
            return (
              <CategoryChip
                key={category}
                category={category}
                index={index}
                isActive={isActive}
                onClick={(e) => handleChipClick(category, e)}
                onDelete={onDeleteCategory ? () => onDeleteCategory(category) : undefined}
                showDelete={isEditMode}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export { CategoryFilters }
