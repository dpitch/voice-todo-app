"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/header";
import { TodoList, type Todo } from "@/components/todo-list";
import { CompletedSection } from "@/components/completed-section";
import { InputBar } from "@/components/input-bar";
import { CategoryFilters } from "@/components/category-filters";
import { useAudioRecorder } from "@/lib/useAudioRecorder";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [categoryChangedTodoId, setCategoryChangedTodoId] = useState<string | null>(null);
  const {
    state: recorderState,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const todosData = useQuery(api.todos.list);
  const categoriesData = useQuery(api.todos.listCategories);
  const toggleComplete = useMutation(api.todos.toggleComplete);
  const updateCategory = useMutation(api.todos.updateCategory);
  const createCategory = useMutation(api.todos.createCategory);
  const deleteCategory = useMutation(api.todos.deleteCategory);
  const processVoiceTodo = useAction(api.ai.processVoiceTodo);
  const processTextTodo = useAction(api.ai.processTextTodo);

  const voiceState = isProcessingVoice ? "processing" : recorderState;
  const isProcessing = isProcessingVoice || isProcessingText;

  // Get all existing category names for AI classification
  const existingCategoryNames = [
    ...new Set([
      ...(categoriesData ?? []).map((c) => c.name),
      ...(todosData ?? []).map((t) => t.category),
    ]),
  ];

  const processAudioBlob = useCallback(
    async (blob: Blob) => {
      setIsProcessingVoice(true);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            if (base64Data) {
              resolve(base64Data);
            } else {
              reject(new Error("Failed to convert audio to base64"));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });

        await processVoiceTodo({ 
          audioData: base64,
          existingCategories: existingCategoryNames,
        });
      } catch (error) {
        console.error("Voice processing failed:", error);
      } finally {
        setIsProcessingVoice(false);
        resetRecording();
      }
    },
    [processVoiceTodo, resetRecording, existingCategoryNames]
  );

  useEffect(() => {
    if (audioBlob && recorderState === "idle" && !isProcessingVoice) {
      processAudioBlob(audioBlob);
    }
  }, [audioBlob, recorderState, isProcessingVoice, processAudioBlob]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const todos: Todo[] = (todosData ?? []).map((todo) => ({
    id: todo._id,
    content: todo.content,
    priority: todo.priority,
    isCompleted: todo.isCompleted,
    category: todo.category,
  }));

  const activeTodos = todos.filter((todo) => !todo.isCompleted);
  
  // Combine categories from saved categories table and from todos
  const categories = [...new Set([
    ...(categoriesData ?? []).map((c) => c.name),
    ...activeTodos.map((todo) => todo.category),
  ])].sort();
  
  const filteredTodos = activeFilter
    ? activeTodos.filter((todo) => todo.category === activeFilter)
    : activeTodos;

  const handleAddCategory = async (name: string) => {
    await createCategory({ name });
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const category = categoriesData?.find((c) => c.name === categoryName);
    if (category) {
      await deleteCategory({ id: category._id });
    }
  };

  const handleSubmit = async (value: string) => {
    if (isProcessing) return;
    
    setIsProcessingText(true);
    try {
      await processTextTodo({
        content: value,
        existingCategories: existingCategoryNames,
      });
      setInputValue("");
    } catch (error) {
      console.error("Text processing failed:", error);
    } finally {
      setIsProcessingText(false);
    }
  };

  const handleToggleComplete = async (id: string) => {
    await toggleComplete({ id: id as Id<"todos"> });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;

    if (!over) return;

    // Check if dropped on a category chip
    const overData = over.data.current;
    if (overData?.type === "category") {
      const todoId = String(active.id);
      const targetCategory = overData.category as string;
      const todo = todos.find((t) => t.id === todoId);

      // Only update if moving to a different category
      if (todo && todo.category !== targetCategory) {
        updateCategory({
          id: todoId as Id<"todos">,
          category: targetCategory,
        });
        // Trigger category change animation
        setCategoryChangedTodoId(todoId);
      }
    }
  };

  // Clear category change animation after it completes
  useEffect(() => {
    if (categoryChangedTodoId) {
      const timer = setTimeout(() => {
        setCategoryChangedTodoId(null);
      }, 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [categoryChangedTodoId]);

  const activeDragTodo = activeDragId
    ? todos.find((t) => t.id === activeDragId)
    : null;

  if (todosData === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-24">
          <CategoryFilters
            categories={categories}
            activeCategory={activeFilter}
            onCategoryChange={setActiveFilter}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
          <TodoList
            todos={filteredTodos}
            onToggleComplete={handleToggleComplete}
            categoryChangedTodoId={categoryChangedTodoId}
          />
          <CompletedSection
            todos={todos}
            onToggleComplete={handleToggleComplete}
          />
        </main>
        <InputBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          voiceState={voiceState}
          onRecord={startRecording}
          onStopRecording={stopRecording}
          isProcessingText={isProcessingText}
        />
      </div>
      <DragOverlay>
        {activeDragTodo ? (
          <div className="rounded-lg border bg-card px-4 py-3 shadow-lg">
            {activeDragTodo.content}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
