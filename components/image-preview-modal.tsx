"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface ImagePreviewModalProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ImagePreviewModal({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex)

  // Reset to initialIndex when modal opens or initialIndex changes
  React.useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
    }
  }, [open, initialIndex])

  const hasMultipleImages = images.length > 1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  const goToPrev = () => {
    if (hasPrev) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const goToNext = () => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, hasPrev, hasNext])

  if (images.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="image-preview-modal"
        className="max-w-4xl p-0 overflow-hidden bg-black/90 border-none"
        showCloseButton
      >
        <div className="relative flex items-center justify-center min-h-[300px] max-h-[80vh]">
          {/* Main image */}
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className="max-w-full max-h-[80vh] object-contain"
            data-slot="preview-image"
          />

          {/* Navigation buttons */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                disabled={!hasPrev}
                data-slot="nav-prev"
                className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white transition-opacity",
                  hasPrev ? "hover:bg-black/70" : "opacity-30 cursor-not-allowed"
                )}
                aria-label="Previous image"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={!hasNext}
                data-slot="nav-next"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white transition-opacity",
                  hasNext ? "hover:bg-black/70" : "opacity-30 cursor-not-allowed"
                )}
                aria-label="Next image"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          {/* Image counter */}
          {hasMultipleImages && (
            <div
              data-slot="image-counter"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm"
            >
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ImagePreviewModal }
