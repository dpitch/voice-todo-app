"use client";

import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VoiceButtonState = "idle" | "recording" | "processing";

interface VoiceButtonProps {
  state?: VoiceButtonState;
  onRecord?: () => void;
  onStop?: () => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceButton({
  state = "idle",
  onRecord,
  onStop,
  disabled = false,
  className,
}: VoiceButtonProps) {
  const isDisabled = disabled || state === "processing";

  const handleClick = () => {
    if (isDisabled) return;

    if (state === "idle") {
      onRecord?.();
    } else if (state === "recording") {
      onStop?.();
    }
  };

  const getAriaLabel = () => {
    switch (state) {
      case "idle":
        return "Start recording";
      case "recording":
        return "Stop recording";
      case "processing":
        return "Processing voice input";
    }
  };

  const getIcon = () => {
    switch (state) {
      case "idle":
        return <Mic className="size-5" />;
      case "recording":
        return <Square className="size-4" />;
      case "processing":
        return <Loader2 className="size-5 animate-spin" />;
    }
  };

  return (
    <Button
      data-slot="voice-button"
      data-state={state}
      variant={state === "recording" ? "destructive" : "ghost"}
      size="icon"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={getAriaLabel()}
      className={cn(
        state === "recording" && "animate-recording-pulse",
        className
      )}
    >
      {getIcon()}
    </Button>
  );
}
