import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header
      data-slot="header"
      className="flex items-center justify-between px-4 py-3 border-b border-border bg-background"
    >
      <h1 className="text-xl font-semibold text-foreground">
        📋 VoiceTodo
      </h1>
      <Button variant="ghost" size="icon" aria-label="Settings">
        <Settings className="size-5" />
      </Button>
    </header>
  );
}
