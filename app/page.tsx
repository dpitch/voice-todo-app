"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/header";
import { TodoList, type Todo } from "@/components/todo-list";
import { CompletedSection } from "@/components/completed-section";
import { InputBar } from "@/components/input-bar";

export default function Home() {
  const [inputValue, setInputValue] = useState("");

  const todosData = useQuery(api.todos.list);
  const createTodo = useMutation(api.todos.create);
  const toggleComplete = useMutation(api.todos.toggleComplete);

  const todos: Todo[] = (todosData ?? []).map((todo) => ({
    id: todo._id,
    content: todo.content,
    priority: todo.priority,
    isCompleted: todo.isCompleted,
    category: todo.category,
  }));

  const activeTodos = todos.filter((todo) => !todo.isCompleted);

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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-24">
        <TodoList
          todos={activeTodos}
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
      />
    </div>
  );
}
