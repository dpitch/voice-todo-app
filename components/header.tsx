import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header
      data-slot="header"
      className="flex items-center justify-between px-4 py-3 border-b border-border bg-background"
    >
      <h1 className="text-xl font-semibold text-foreground">
        📋 VoiceTodo
      </h1>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="size-5" />
        </Button>
      </div>
    </header>
  );
}
