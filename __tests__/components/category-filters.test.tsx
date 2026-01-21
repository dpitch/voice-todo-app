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
    it("renders nothing when categories array is empty", () => {
      const { container } = render(<CategoryFilters categories={[]} />)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe("active state", () => {
    it("marks active category chip with data-active='true'", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategory="Home" />)
      const homeChip = screen.getByText("Home")
      expect(homeChip).toHaveAttribute("data-active", "true")
    })

    it("marks inactive category chips with data-active='false'", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategory="Home" />)
      const shoppingChip = screen.getByText("Shopping")
      const workChip = screen.getByText("Work")
      expect(shoppingChip).toHaveAttribute("data-active", "false")
      expect(workChip).toHaveAttribute("data-active", "false")
    })

    it("marks active chip with aria-pressed='true'", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategory="Shopping" />)
      const shoppingChip = screen.getByText("Shopping")
      expect(shoppingChip).toHaveAttribute("aria-pressed", "true")
    })

    it("marks inactive chips with aria-pressed='false'", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategory="Shopping" />)
      const homeChip = screen.getByText("Home")
      expect(homeChip).toHaveAttribute("aria-pressed", "false")
    })

    it("has no active chip when activeCategory is null", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategory={null} />)
      const chips = document.querySelectorAll("[data-slot='category-chip']")
      chips.forEach((chip) => {
        expect(chip).toHaveAttribute("data-active", "false")
        expect(chip).toHaveAttribute("aria-pressed", "false")
      })
    })
  })

  describe("click interactions", () => {
    it("calls onCategoryChange with category when chip is clicked", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          onCategoryChange={handleChange}
        />
      )

      const homeChip = screen.getByText("Home")
      fireEvent.click(homeChip)

      expect(handleChange).toHaveBeenCalledWith("Home")
    })

    it("calls onCategoryChange with null when active chip is clicked", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategory="Home"
          onCategoryChange={handleChange}
        />
      )

      const homeChip = screen.getByText("Home")
      fireEvent.click(homeChip)

      expect(handleChange).toHaveBeenCalledWith(null)
    })

    it("does not throw when onCategoryChange is not provided", () => {
      render(<CategoryFilters categories={sampleCategories} />)

      const homeChip = screen.getByText("Home")
      expect(() => fireEvent.click(homeChip)).not.toThrow()
    })

    it("switches active category when different chip is clicked", () => {
      const handleChange = jest.fn()
      render(
        <CategoryFilters
          categories={sampleCategories}
          activeCategory="Home"
          onCategoryChange={handleChange}
        />
      )

      const shoppingChip = screen.getByText("Shopping")
      fireEvent.click(shoppingChip)

      expect(handleChange).toHaveBeenCalledWith("Shopping")
    })
  })

  describe("chip styling", () => {
    it("applies active styles to active chip", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategory="Home" />)
      const homeChip = screen.getByText("Home")
      expect(homeChip).toHaveClass("bg-primary", "text-primary-foreground")
    })

    it("applies inactive styles to inactive chips", () => {
      render(<CategoryFilters categories={sampleCategories} activeCategory="Home" />)
      const shoppingChip = screen.getByText("Shopping")
      expect(shoppingChip).toHaveClass("bg-muted", "text-muted-foreground")
    })
  })
})
