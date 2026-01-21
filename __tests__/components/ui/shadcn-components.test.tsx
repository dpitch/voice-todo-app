import { render, screen, fireEvent } from "@testing-library/react";
import fs from "fs";
import path from "path";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

describe("shadcn/ui components installation", () => {
  const uiDir = path.join(process.cwd(), "components", "ui");

  it("components/ui directory exists", () => {
    expect(fs.existsSync(uiDir)).toBe(true);
  });

  const requiredComponents = [
    "button.tsx",
    "input.tsx",
    "checkbox.tsx",
    "card.tsx",
    "collapsible.tsx",
  ];

  requiredComponents.forEach((component) => {
    it(`${component} exists`, () => {
      const componentPath = path.join(uiDir, component);
      expect(fs.existsSync(componentPath)).toBe(true);
    });
  });
});

describe("Button component", () => {
  it("renders a button with default variant", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).toHaveAttribute("data-size", "default");
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "destructive"
    );

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "outline"
    );

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "secondary"
    );

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "ghost");

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "link");
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "icon");
  });

  it("supports disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("exports buttonVariants for external use", () => {
    expect(buttonVariants).toBeDefined();
    expect(typeof buttonVariants).toBe("function");
  });
});

describe("Input component", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("supports different input types", () => {
    const { rerender } = render(<Input type="email" aria-label="Email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" aria-label="Password" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("handles value changes", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} aria-label="Test input" />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test value" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("supports disabled state", () => {
    render(<Input disabled aria-label="Disabled input" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" aria-label="Custom input" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-input");
  });
});

describe("Checkbox component", () => {
  it("renders a checkbox", () => {
    render(<Checkbox aria-label="Accept terms" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("data-slot", "checkbox");
  });

  it("can be checked and unchecked", () => {
    render(<Checkbox aria-label="Toggle me" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("supports controlled checked state", () => {
    const { rerender } = render(
      <Checkbox checked={false} aria-label="Controlled" />
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();

    rerender(<Checkbox checked={true} aria-label="Controlled" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("supports disabled state", () => {
    render(<Checkbox disabled aria-label="Disabled checkbox" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("handles onCheckedChange callback", () => {
    const handleChange = jest.fn();
    render(
      <Checkbox onCheckedChange={handleChange} aria-label="With callback" />
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("applies custom className", () => {
    render(<Checkbox className="custom-checkbox" aria-label="Custom" />);
    expect(screen.getByRole("checkbox")).toHaveClass("custom-checkbox");
  });
});

describe("Card components", () => {
  it("renders Card with all subcomponents", () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Title</CardTitle>
          <CardDescription data-testid="card-description">
            Description
          </CardDescription>
          <CardAction data-testid="card-action">Action</CardAction>
        </CardHeader>
        <CardContent data-testid="card-content">Content</CardContent>
        <CardFooter data-testid="card-footer">Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
    expect(screen.getByTestId("card-header")).toHaveAttribute(
      "data-slot",
      "card-header"
    );
    expect(screen.getByTestId("card-title")).toHaveAttribute(
      "data-slot",
      "card-title"
    );
    expect(screen.getByTestId("card-description")).toHaveAttribute(
      "data-slot",
      "card-description"
    );
    expect(screen.getByTestId("card-action")).toHaveAttribute(
      "data-slot",
      "card-action"
    );
    expect(screen.getByTestId("card-content")).toHaveAttribute(
      "data-slot",
      "card-content"
    );
    expect(screen.getByTestId("card-footer")).toHaveAttribute(
      "data-slot",
      "card-footer"
    );
  });

  it("renders text content correctly", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("Test Footer")).toBeInTheDocument();
  });

  it("applies custom className to Card", () => {
    render(
      <Card className="custom-card" data-testid="card">
        Content
      </Card>
    );
    expect(screen.getByTestId("card")).toHaveClass("custom-card");
  });

  it("applies custom className to subcomponents", () => {
    render(
      <Card>
        <CardHeader className="custom-header" data-testid="header">
          <CardTitle className="custom-title" data-testid="title">
            Title
          </CardTitle>
        </CardHeader>
        <CardContent className="custom-content" data-testid="content">
          Content
        </CardContent>
      </Card>
    );

    expect(screen.getByTestId("header")).toHaveClass("custom-header");
    expect(screen.getByTestId("title")).toHaveClass("custom-title");
    expect(screen.getByTestId("content")).toHaveClass("custom-content");
  });
});

describe("Collapsible components", () => {
  it("renders Collapsible with trigger and content", () => {
    render(
      <Collapsible data-testid="collapsible">
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">
          Hidden content
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId("collapsible")).toHaveAttribute(
      "data-slot",
      "collapsible"
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute(
      "data-slot",
      "collapsible-trigger"
    );
    expect(screen.getByTestId("content")).toHaveAttribute(
      "data-slot",
      "collapsible-content"
    );
  });

  it("toggles content visibility on trigger click", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">
          Hidden content
        </CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText("Toggle");
    const content = screen.getByTestId("content");

    // Initially closed
    expect(content).toHaveAttribute("data-state", "closed");
    expect(content).toHaveAttribute("hidden");

    // Click to open
    fireEvent.click(trigger);
    expect(content).toHaveAttribute("data-state", "open");
    expect(content).not.toHaveAttribute("hidden");
    expect(screen.getByText("Hidden content")).toBeInTheDocument();

    // Click to close
    fireEvent.click(trigger);
    expect(content).toHaveAttribute("data-state", "closed");
  });

  it("supports controlled open state", () => {
    const { rerender } = render(
      <Collapsible open={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId("content")).toHaveAttribute("data-state", "closed");

    rerender(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
  });

  it("calls onOpenChange when toggled", () => {
    const handleOpenChange = jest.fn();
    render(
      <Collapsible onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it("supports defaultOpen prop", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
  });
});
