import { render, screen } from "@testing-library/react";

// Mock the convex/react module
jest.mock("convex/react", () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
  ConvexReactClient: jest.fn().mockImplementation(() => ({})),
}));

// Import after mocking
import { ConvexClientProvider } from "../app/ConvexClientProvider";
import { ConvexReactClient } from "convex/react";

describe("ConvexClientProvider", () => {
  it("renders children within ConvexProvider", () => {
    render(
      <ConvexClientProvider>
        <div data-testid="child-component">Test Child</div>
      </ConvexClientProvider>
    );

    const provider = screen.getByTestId("convex-provider");
    expect(provider).toBeInTheDocument();

    const child = screen.getByTestId("child-component");
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent("Test Child");
  });

  it("initializes ConvexReactClient with environment URL", () => {
    // The ConvexReactClient is called during module initialization
    // In the test environment, NEXT_PUBLIC_CONVEX_URL is undefined
    // This test verifies that the component attempts to create a client
    expect(ConvexReactClient).toHaveBeenCalled();
  });

  it("wraps multiple children correctly", () => {
    render(
      <ConvexClientProvider>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
      </ConvexClientProvider>
    );

    expect(screen.getByTestId("first")).toBeInTheDocument();
    expect(screen.getByTestId("second")).toBeInTheDocument();
  });
});
