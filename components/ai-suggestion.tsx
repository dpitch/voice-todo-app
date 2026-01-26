"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { Sparkles, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface AiSuggestionProps {
  todoContent: string
  todoCategory: string
  currentNotes: string
  className?: string
}

function AiSuggestion({
  todoContent,
  todoCategory,
  currentNotes,
  className,
}: AiSuggestionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastNotesRef = useRef<string>("")
  const hasGeneratedRef = useRef(false)

  const generateSuggestion = useAction(api.aiAssistant.generateSuggestion)

  const fetchSuggestion = useCallback(async () => {
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await generateSuggestion({
        todoContent,
        todoCategory,
        currentNotes,
      })
      setSuggestion(result.suggestion)
      hasGeneratedRef.current = true
    } catch (err) {
      console.error("Failed to generate suggestion:", err)
      setError("Impossible de générer une suggestion")
    } finally {
      setIsLoading(false)
    }
  }, [generateSuggestion, todoContent, todoCategory, currentNotes, isLoading])

  // Generate initial suggestion when component mounts or todo changes
  useEffect(() => {
    hasGeneratedRef.current = false
    setSuggestion(null)
    lastNotesRef.current = ""
    
    // Small delay before generating initial suggestion
    const timer = setTimeout(() => {
      fetchSuggestion()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [todoContent, todoCategory]) // Only regenerate when todo changes, not notes

  // Debounce notes changes to regenerate suggestion
  useEffect(() => {
    // Skip if notes haven't changed meaningfully (at least 20 chars difference)
    const notesDiff = Math.abs(currentNotes.length - lastNotesRef.current.length)
    if (notesDiff < 20 && hasGeneratedRef.current) {
      return
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer to regenerate after 2 seconds of no typing
    debounceTimerRef.current = setTimeout(() => {
      if (currentNotes !== lastNotesRef.current) {
        lastNotesRef.current = currentNotes
        fetchSuggestion()
      }
    }, 2000)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [currentNotes, fetchSuggestion])

  const handleRefresh = () => {
    fetchSuggestion()
  }

  return (
    <div
      data-slot="ai-suggestion"
      className={cn(
        "rounded-md border border-border/50 bg-muted/30 p-3",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span>Suggestion IA</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={handleRefresh}
          disabled={isLoading}
          title="Régénérer la suggestion"
        >
          {isLoading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
        </Button>
      </div>

      <div className="text-sm">
        {isLoading && !suggestion ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            <span>Génération en cours...</span>
          </div>
        ) : error ? (
          <p className="text-destructive text-xs">{error}</p>
        ) : suggestion ? (
          <p className="text-foreground/90 leading-relaxed">{suggestion}</p>
        ) : (
          <p className="text-muted-foreground italic">
            Une suggestion apparaîtra ici...
          </p>
        )}
      </div>
    </div>
  )
}

export { AiSuggestion }
