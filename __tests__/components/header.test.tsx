import { render, screen } from "@testing-library/react";
import { Header } from "@/components/header";

describe("Header component", () => {
  it("renders the header element", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("data-slot", "header");
  });

  it("displays the VoiceTodo title with emoji", () => {
    render(<Header />);
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("📋 VoiceTodo");
  });

  it("renders the settings button", () => {
    render(<Header />);
    const settingsButton = screen.getByRole("button", { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  it("settings button has ghost variant and icon size", () => {
    render(<Header />);
    const settingsButton = screen.getByRole("button", { name: /settings/i });
    expect(settingsButton).toHaveAttribute("data-variant", "ghost");
    expect(settingsButton).toHaveAttribute("data-size", "icon");
  });

  it("contains the Settings icon", () => {
    render(<Header />);
    const settingsButton = screen.getByRole("button", { name: /settings/i });
    const svgIcon = settingsButton.querySelector("svg");
    expect(svgIcon).toBeInTheDocument();
  });
});
