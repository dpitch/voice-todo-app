"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VoiceButton, type VoiceButtonState } from "@/components/voice-button";
import { cn } from "@/lib/utils";

interface InputBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onRecord?: () => void;
  onStopRecording?: () => void;
  onImagesPaste?: (files: File[]) => void;
  voiceState?: VoiceButtonState;
  isProcessingText?: boolean;
  placeholder?: string;
  className?: string;
}

export function InputBar({
  value = "",
  onChange,
  onSubmit,
  onRecord,
  onStopRecording,
  onImagesPaste,
  voiceState = "idle",
  isProcessingText = false,
  placeholder = "Ajouter un todo...",
  className,
}: InputBarProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && !isProcessingText) {
      onSubmit?.(value.trim());
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const files = e.clipboardData?.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length > 0) {
      e.preventDefault();
      onImagesPaste?.(imageFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length > 0) {
      onImagesPaste?.(imageFiles);
    }
  };

  return (
    <div
      data-slot="input-bar"
      className={cn(
        "fixed bottom-0 left-0 right-0 border-t border-border bg-background px-4 py-3 transition-colors",
        isDragOver && "border-primary border-t-2 bg-primary/5",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={isDragOver ? "Déposez vos images ici..." : placeholder}
            className="flex-1 pr-8"
            aria-label="Task input"
            disabled={isProcessingText}
          />
          {isProcessingText && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <VoiceButton
          state={voiceState}
          onRecord={onRecord}
          onStop={onStopRecording}
          disabled={isProcessingText}
        />
      </div>
    </div>
  );
}
