"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle, Loader2, RefreshCw, X } from "lucide-react";
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
  onRemoveImage?: (index: number) => void;
  pendingImages?: File[];
  voiceState?: VoiceButtonState;
  isProcessingText?: boolean;
  imageError?: string | null;
  onRetryImageUpload?: () => void;
  onClearImageError?: () => void;
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
  onRemoveImage,
  pendingImages = [],
  voiceState = "idle",
  isProcessingText = false,
  imageError = null,
  onRetryImageUpload,
  onClearImageError,
  placeholder = "Ajouter un todo...",
  className,
}: InputBarProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Create object URLs for pending images
  const imagePreviewUrls = useMemo(() => {
    return pendingImages.map((file) => URL.createObjectURL(file));
  }, [pendingImages]);

  // Cleanup object URLs when they change
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow submission if there's text OR if there are pending images (for Vision analysis)
    const canSubmit = value.trim() || pendingImages.length > 0;
    if (e.key === "Enter" && canSubmit && !isProcessingText) {
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
      <div className="mx-auto max-w-3xl">
        {/* Image error display */}
        {imageError && (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{imageError}</span>
            <button
              type="button"
              onClick={onRetryImageUpload}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-destructive/20"
              aria-label="Réessayer"
            >
              <RefreshCw className="h-3 w-3" />
              Réessayer
            </button>
            <button
              type="button"
              onClick={onClearImageError}
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-destructive/20"
              aria-label="Fermer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {/* Pending images preview */}
        {pendingImages.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {imagePreviewUrls.map((url, index) => (
              <div
                key={`${pendingImages[index].name}-${index}`}
                className="group relative h-12 w-12 overflow-hidden rounded-md border border-border"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage?.(index)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
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
    </div>
  );
}
