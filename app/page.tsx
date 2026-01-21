"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
  const { state: voiceState, startRecording, stopRecording } = useAudioRecorder();

  const todosData = useQuery(api.todos.list);
  const createTodo = useMutation(api.todos.create);
  const toggleComplete = useMutation(api.todos.toggleComplete);
  const updateCategory = useMutation(api.todos.updateCategory);

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
  const categories = [...new Set(activeTodos.map((todo) => todo.category))].sort();
  const filteredTodos = activeFilter
    ? activeTodos.filter((todo) => todo.category === activeFilter)
    : activeTodos;

  const handleSubmit = async (value: string) => {
    await createTodo({
      content: value,
      category: "General",
      priority: "medium",
      isCompleted: false,
      createdAt: Date.now(),
    });
    setInputValue("");
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
      }
    }
  };

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
          />
          <TodoList
            todos={filteredTodos}
            onToggleComplete={handleToggleComplete}
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
