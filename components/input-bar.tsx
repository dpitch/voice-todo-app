"use client";

import { Input } from "@/components/ui/input";
import { VoiceButton, type VoiceButtonState } from "@/components/voice-button";
import { cn } from "@/lib/utils";

interface InputBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onRecord?: () => void;
  onStopRecording?: () => void;
  voiceState?: VoiceButtonState;
  placeholder?: string;
  className?: string;
}

export function InputBar({
  value = "",
  onChange,
  onSubmit,
  onRecord,
  onStopRecording,
  voiceState = "idle",
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
        <VoiceButton
          state={voiceState}
          onRecord={onRecord}
          onStop={onStopRecording}
        />
      </div>
    </div>
  );
}
