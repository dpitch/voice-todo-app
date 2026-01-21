"use client";

import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onMicClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function InputBar({
  value = "",
  onChange,
  onSubmit,
  onMicClick,
  placeholder = "Add a new task...",
  className,
}: InputBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit?.(value.trim());
    }
  };

  return (
    <div
      data-slot="input-bar"
      className={cn(
        "fixed bottom-0 left-0 right-0 border-t border-border bg-background px-4 py-3",
        className
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          aria-label="Task input"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onMicClick}
          aria-label="Voice input"
        >
          <Mic className="size-5" />
        </Button>
      </div>
    </div>
  );
}
