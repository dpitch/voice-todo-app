import { render, screen } from "@testing-library/react"
import { CategoryFilters } from "@/components/category-filters"
import { DndContext } from "@dnd-kit/core"

describe("CategoryFilters drop zone functionality", () => {
  const sampleCategories = ["Home", "Shopping", "Work"]

  const renderWithDndContext = (ui: React.ReactElement) => {
    return render(<DndContext>{ui}</DndContext>)
  }

  describe("drop zone setup", () => {
    it("renders category chips with data-category attribute", () => {
      renderWithDndContext(<CategoryFilters categories={sampleCategories} />)

      sampleCategories.forEach((category) => {
        const chip = screen.getByText(category)
        expect(chip).toHaveAttribute("data-category", category)
      })
    })

    it("renders category chips with data-drag-over attribute", () => {
      renderWithDndContext(<CategoryFilters categories={sampleCategories} />)

      const chips = document.querySelectorAll("[data-slot='category-chip']")
      chips.forEach((chip) => {
        expect(chip).toHaveAttribute("data-drag-over", "false")
      })
    })

    it("category chips are valid drop targets", () => {
      renderWithDndContext(<CategoryFilters categories={sampleCategories} />)

      const chips = document.querySelectorAll("[data-slot='category-chip']")
      expect(chips).toHaveLength(3)

      // Each chip should have data-category attribute for drop handling
      chips.forEach((chip, index) => {
        expect(chip).toHaveAttribute("data-category", sampleCategories[index])
      })
    })
  })

  describe("drop zone styling", () => {
    it("chips have transition classes for smooth visual feedback", () => {
      renderWithDndContext(<CategoryFilters categories={sampleCategories} />)

      const chip = screen.getByText("Home")
      expect(chip).toHaveClass("transition-colors")
    })

    it("inactive chips have muted background by default", () => {
      renderWithDndContext(<CategoryFilters categories={sampleCategories} />)

      const chip = screen.getByText("Home")
      expect(chip).toHaveClass("bg-muted")
    })

    it("active chips maintain primary background", () => {
      renderWithDndContext(
        <CategoryFilters categories={sampleCategories} activeCategories={["Home"]} />
      )

      const chip = screen.getByText("Home")
      expect(chip).toHaveClass("bg-primary")
    })
  })

  describe("accessibility", () => {
    it("category chips remain accessible as buttons when used as drop targets", () => {
      renderWithDndContext(<CategoryFilters categories={sampleCategories} />)

      const chips = document.querySelectorAll("[data-slot='category-chip']")
      expect(chips).toHaveLength(3)
      
      // Each chip should be a button
      chips.forEach((chip) => {
        expect(chip.tagName.toLowerCase()).toBe("button")
      })
    })

    it("aria-pressed is maintained for drop target chips", () => {
      renderWithDndContext(
        <CategoryFilters categories={sampleCategories} activeCategories={["Shopping"]} />
      )

      const shoppingChip = screen.getByText("Shopping")
      expect(shoppingChip).toHaveAttribute("aria-pressed", "true")

      const homeChip = screen.getByText("Home")
      expect(homeChip).toHaveAttribute("aria-pressed", "false")
    })
  })
})
