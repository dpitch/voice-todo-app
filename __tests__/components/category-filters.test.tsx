import { render, screen, fireEvent } from "@testing-library/react"
import { CategoryFilters } from "@/components/category-filters"

describe("CategoryFilters component", () => {
  const sampleCategories = ["Home", "Shopping", "Work"]

  describe("rendering", () => {
    it("renders the category filters container", () => {
      render(<CategoryFilters categories={sampleCategories} />)
      const container = document.querySelector("[data-slot='category-filters']")
      expect(container).toBeInTheDocument()
    })

    it("renders all category chips", () => {
      render(<CategoryFilters categories={sampleCategories} />)
      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(screen.getByText("Shopping")).toBeInTheDocument()
      expect(screen.getByText("Work")).toBeInTheDocument()
    })

    it("renders chips with data-slot attribute", () => {
      render(<CategoryFilters categories={sampleCategories} />)
      const chips = document.querySelectorAll("[data-slot='category-chip']")
      expect(chips).toHaveLength(3)
    })

    it("applies custom className", () => {
      render(<CategoryFilters categories={sampleCategories} className="custom-class" />)
      const container = document.querySelector("[data-slot='category-filters']")
      expect(container).toHaveClass("custom-class")
    })

    it("renders with role='group' for accessibility", () => {
      render(<CategoryFilters categories={sampleCategories} />)
      const group = screen.getByRole("group", { name: /filter by category/i })
      expect(group).toBeInTheDocument()
    })
  })

  describe("empty state", () => {
    it("renders empty state message when categories array is empty", () => {
      render(<CategoryFilters categories={[]} />)
      expect(screen.getByText(/Aucun thème/)).toBeInTheDocument()
    })

    it("does not render any category chips when categories array is empty", () => {
      render(<CategoryFilters categories={[]} />)
      const chips = document.querySelectorAll("[data-slot='category-chip']")
      expect(chips).toHaveLength(0)
    })
  })

  describe("active state", () => {
    it("marks active category chip with data-active='true'", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategories={["Home"]} />)
      const homeChip = screen.getByText("Home")
      expect(homeChip).toHaveAttribute("data-active", "true")
    })

    it("marks inactive category chips with data-active='false'", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategories={["Home"]} />)
      const shoppingChip = screen.getByText("Shopping")
      const workChip = screen.getByText("Work")
      expect(shoppingChip).toHaveAttribute("data-active", "false")
      expect(workChip).toHaveAttribute("data-active", "false")
    })

    it("marks active chip with aria-pressed='true'", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategories={["Shopping"]} />)
      const shoppingChip = screen.getByText("Shopping")
      expect(shoppingChip).toHaveAttribute("aria-pressed", "true")
    })

    it("marks inactive chips with aria-pressed='false'", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategories={["Shopping"]} />)
      const homeChip = screen.getByText("Home")
      expect(homeChip).toHaveAttribute("aria-pressed", "false")
    })

    it("has no active chip when activeCategories is empty", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategories={[]} />)
      const chips = document.querySelectorAll("[data-slot='category-chip']")
      chips.forEach((chip) => {
        expect(chip).toHaveAttribute("data-active", "false")
        expect(chip).toHaveAttribute("aria-pressed", "false")
      })
    })

    it("marks multiple chips as active when multiple categories are selected", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategories={["Home", "Work"]} />)
      const homeChip = screen.getByText("Home")
      const workChip = screen.getByText("Work")
      const shoppingChip = screen.getByText("Shopping")
      expect(homeChip).toHaveAttribute("data-active", "true")
      expect(workChip).toHaveAttribute("data-active", "true")
      expect(shoppingChip).toHaveAttribute("data-active", "false")
    })
  })

  describe("click interactions", () => {
    it("calls onCategoryChange with category array when chip is clicked", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          onCategoryChange={handleChange}
        />
      )

      const homeChip = screen.getByText("Home")
      fireEvent.click(homeChip)

      expect(handleChange).toHaveBeenCalledWith(["Home"])
    })

    it("calls onCategoryChange with empty array when the only active chip is clicked", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategories={["Home"]}
          onCategoryChange={handleChange}
        />
      )

      const homeChip = screen.getByText("Home")
      fireEvent.click(homeChip)

      expect(handleChange).toHaveBeenCalledWith([])
    })

    it("does not throw when onCategoryChange is not provided", () => {
      render(<CategoryFilters categories={sampleCategories} />)

      const homeChip = screen.getByText("Home")
      expect(() => fireEvent.click(homeChip)).not.toThrow()
    })

    it("switches active category when different chip is clicked (replaces selection)", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategories={["Home"]}
          onCategoryChange={handleChange}
        />
      )

      const shoppingChip = screen.getByText("Shopping")
      fireEvent.click(shoppingChip)

      expect(handleChange).toHaveBeenCalledWith(["Shopping"])
    })
  })

  describe("multi-select with Cmd+click", () => {
    it("adds category to selection when Cmd+clicking an inactive chip", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategories={["Home"]}
          onCategoryChange={handleChange}
        />
      )

      const shoppingChip = screen.getByText("Shopping")
      fireEvent.click(shoppingChip, { metaKey: true })

      expect(handleChange).toHaveBeenCalledWith(["Home", "Shopping"])
    })

    it("removes category from selection when Cmd+clicking an active chip", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategories={["Home", "Shopping"]}
          onCategoryChange={handleChange}
        />
      )

      const homeChip = screen.getByText("Home")
      fireEvent.click(homeChip, { metaKey: true })

      expect(handleChange).toHaveBeenCalledWith(["Shopping"])
    })

    it("adds first category when Cmd+clicking with no active categories", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategories={[]}
          onCategoryChange={handleChange}
        />
      )

      const workChip = screen.getByText("Work")
      fireEvent.click(workChip, { metaKey: true })

      expect(handleChange).toHaveBeenCalledWith(["Work"])
    })
  })

  describe("clear all filters button", () => {
    it("shows clear button when there are active categories", () => {
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategories={["Home"]}
        />
      )

      const clearButton = screen.getByLabelText("Effacer tous les filtres")
      expect(clearButton).toBeInTheDocument()
    })

    it("does not show clear button when no categories are active", () => {
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategories={[]}
        />
      )

      const clearButton = screen.queryByLabelText("Effacer tous les filtres")
      expect(clearButton).not.toBeInTheDocument()
    })

    it("calls onCategoryChange with empty array when clear button is clicked", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategories={["Home", "Shopping"]}
          onCategoryChange={handleChange}
        />
      )

      const clearButton = screen.getByLabelText("Effacer tous les filtres")
      fireEvent.click(clearButton)

      expect(handleChange).toHaveBeenCalledWith([])
    })
  })

  describe("chip styling", () => {
    it("applies active styles to active chip", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategories={["Home"]} />)
      const homeChip = screen.getByText("Home")
      expect(homeChip).toHaveClass("bg-primary", "text-primary-foreground")
    })

    it("applies inactive styles to inactive chips", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategories={["Home"]} />)
      const shoppingChip = screen.getByText("Shopping")
      expect(shoppingChip).toHaveClass("bg-muted", "text-muted-foreground")
    })
  })
})
