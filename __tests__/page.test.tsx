import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home Page", () => {
  it("renders the Next.js logo", () => {
    render(<Home />);
    const logo = screen.getByAltText("Next.js logo");
    expect(logo).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("To get started, edit the page.tsx file.");
  });

  it("renders the Deploy Now link", () => {
    render(<Home />);
    const deployLink = screen.getByRole("link", { name: /deploy now/i });
    expect(deployLink).toBeInTheDocument();
    expect(deployLink).toHaveAttribute("href", expect.stringContaining("vercel.com"));
  });

  it("renders the Documentation link", () => {
    render(<Home />);
    const docsLink = screen.getByRole("link", { name: /documentation/i });
    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute("href", expect.stringContaining("nextjs.org/docs"));
  });

  it("renders the Templates link", () => {
    render(<Home />);
    const templatesLink = screen.getByRole("link", { name: /templates/i });
    expect(templatesLink).toBeInTheDocument();
  });

  it("renders the Learning link", () => {
    render(<Home />);
    const learningLink = screen.getByRole("link", { name: /learning/i });
    expect(learningLink).toBeInTheDocument();
  });
});
