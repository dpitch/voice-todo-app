"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/header";
import { TodoList, type Todo } from "@/components/todo-list";
import { ProcessingSection } from "@/components/processing-section";
import { CompletedSection } from "@/components/completed-section";
import { InputBar } from "@/components/input-bar";
import { CategoryFilters } from "@/components/category-filters";
import { ImagePreviewModal } from "@/components/image-preview-modal";
import { useAudioRecorder } from "@/lib/useAudioRecorder";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [categoryChangedTodoId, setCategoryChangedTodoId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const {
    state: recorderState,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const todosData = useQuery(api.todos.list);
  const categoriesData = useQuery(api.todos.listCategories);

  // Collect all unique storage IDs from todos for URL resolution
  const allStorageIds = useMemo(() => {
    if (!todosData) return [];
    const ids: Id<"_storage">[] = [];
    for (const todo of todosData) {
      if (todo.imageStorageIds) {
        ids.push(...todo.imageStorageIds);
      }
    }
    return ids;
  }, [todosData]);

  // Query image URLs for all storage IDs
  const imageUrlsData = useQuery(
    api.todos.getImageUrls,
    allStorageIds.length > 0 ? { storageIds: allStorageIds } : "skip"
  );

  // Create a map from storageId to URL for efficient lookup
  const storageIdToUrl = useMemo(() => {
    const map = new Map<string, string>();
    if (imageUrlsData && allStorageIds.length > 0) {
      // The query returns URLs in the same order as the input storageIds
      let urlIndex = 0;
      for (const storageId of allStorageIds) {
        if (urlIndex < imageUrlsData.length) {
          map.set(storageId, imageUrlsData[urlIndex]);
          urlIndex++;
        }
      }
    }
    return map;
  }, [imageUrlsData, allStorageIds]);
  const toggleComplete = useMutation(api.todos.toggleComplete);
  const updateCategory = useMutation(api.todos.updateCategory);
  const updateTodo = useMutation(api.todos.update);
  const createCategory = useMutation(api.todos.createCategory);
  const deleteCategory = useMutation(api.todos.deleteCategory);
  const generateUploadUrl = useMutation(api.ai.generateUploadUrl);
  const processVoiceTodo = useAction(api.ai.processVoiceTodo);
  const processTextTodo = useAction(api.ai.processTextTodo);
  const processImageTodo = useAction(api.ai.processImageTodo);

  const voiceState = isProcessingVoice ? "processing" : recorderState;
  // Only block input during voice recording conversion or image upload (not text processing)
  const isProcessing = isProcessingVoice || isUploadingImages;

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

        // Reset voice state immediately - the todo will appear in processing section
        setIsProcessingVoice(false);
        resetRecording();

        // Process in background
        processVoiceTodo({ 
          audioData: base64,
          existingCategories: existingCategoryNames,
        }).catch((error) => {
          console.error("Voice processing failed:", error);
        });
      } catch (error) {
        console.error("Voice processing failed:", error);
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

  const todos: Todo[] = (todosData ?? []).map((todo) => {
    // Resolve image URLs from storage IDs
    const imageUrls = todo.imageStorageIds
      ?.map((storageId) => storageIdToUrl.get(storageId))
      .filter((url): url is string => url !== undefined);

    return {
      id: todo._id,
      content: todo.content,
      priority: todo.priority,
      isCompleted: todo.isCompleted,
      category: todo.category,
      imageStorageIds: todo.imageStorageIds,
      imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : undefined,
      isProcessing: todo.isProcessing ?? false,
    };
  });

  const activeTodos = todos.filter((todo) => !todo.isCompleted);
  
  // Separate processing todos from ready todos
  const processingTodos = activeTodos.filter((todo) => todo.isProcessing);
  const readyTodos = activeTodos.filter((todo) => !todo.isProcessing);
  
  // Combine categories from saved categories table and from ready todos only
  const categories = [...new Set([
    ...(categoriesData ?? []).map((c) => c.name),
    ...readyTodos.map((todo) => todo.category),
  ])].filter((cat) => cat !== "...").sort();
  
  const filteredTodos = activeFilter.length > 0
    ? readyTodos.filter((todo) => activeFilter.includes(todo.category))
    : readyTodos;

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

    // If there are pending images, process them with optional text
    if (pendingImages.length > 0) {
      await handleImageSubmit(value || undefined);
      return;
    }

    // Clear input immediately for instant feedback
    setInputValue("");

    // Process in background - the todo will appear immediately thanks to optimistic update
    processTextTodo({
      content: value,
      existingCategories: existingCategoryNames,
    }).catch((error) => {
      console.error("Text processing failed:", error);
    });
  };

  const handleToggleComplete = async (id: string) => {
    await toggleComplete({ id: id as Id<"todos"> });
  };

  const handleEditTodo = async (id: string, newContent: string) => {
    await updateTodo({ id: id as Id<"todos">, content: newContent });
  };

  const handleImagesPaste = (files: File[]) => {
    setImageError(null);
    setPendingImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageSubmit = async (userText?: string) => {
    if (isProcessing || pendingImages.length === 0) return;

    setIsUploadingImages(true);
    setImageError(null);

    try {
      // Step 1: Upload all images
      const storageIds: Id<"_storage">[] = [];
      for (const file of pendingImages) {
        const uploadUrl = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload échoué pour ${file.name}`);
        }

        const { storageId } = await uploadResponse.json();
        storageIds.push(storageId as Id<"_storage">);
      }

      // Clear state immediately after upload - todo will appear in processing section
      setPendingImages([]);
      setInputValue("");
      setIsUploadingImages(false);

      // Process in background
      processImageTodo({
        storageIds,
        userText: userText?.trim() || undefined,
        existingCategories: existingCategoryNames,
      }).catch((error) => {
        console.error("Image processing failed:", error);
        setImageError(
          error instanceof Error ? error.message : "Erreur lors du traitement de l'image"
        );
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      setImageError(
        error instanceof Error ? error.message : "Erreur lors de l'upload de l'image"
      );
      setIsUploadingImages(false);
    }
  };

  const handleRetryImageUpload = () => {
    handleImageSubmit(inputValue || undefined);
  };

  const handleClearImageError = () => {
    setImageError(null);
    setPendingImages([]);
  };

  const handleImageClick = (todoId: string, imageIndex: number) => {
    const todo = todos.find((t) => t.id === todoId);
    if (todo?.imageUrls && todo.imageUrls.length > 0) {
      setSelectedImages(todo.imageUrls);
      setSelectedImageIndex(imageIndex);
      setIsImageModalOpen(true);
    }
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

  // Track previous processing todo IDs to detect when a todo finishes processing
  const prevProcessingIdsRef = useRef<Set<string>>(new Set());
  
  // Detect when a todo finishes processing and trigger category change animation
  useEffect(() => {
    const currentProcessingIds = new Set(processingTodos.map((t) => t.id));
    const prevProcessingIds = prevProcessingIdsRef.current;
    
    // Find todos that were processing but are no longer processing
    for (const id of prevProcessingIds) {
      if (!currentProcessingIds.has(id)) {
        // This todo just finished processing - trigger animation
        setCategoryChangedTodoId(id);
        break; // Only animate one at a time
      }
    }
    
    prevProcessingIdsRef.current = currentProcessingIds;
  }, [processingTodos]);

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
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-24">
          <CategoryFilters
            categories={categories}
            activeCategories={activeFilter}
            onCategoryChange={setActiveFilter}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
          <ProcessingSection
            todos={processingTodos}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTodo}
            onImageClick={handleImageClick}
          />
          <TodoList
            todos={filteredTodos}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTodo}
            onImageClick={handleImageClick}
            categoryChangedTodoId={categoryChangedTodoId}
          />
          <CompletedSection
            todos={todos}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTodo}
            onImageClick={handleImageClick}
          />
        </main>
        <InputBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          voiceState={voiceState}
          onRecord={startRecording}
          onStopRecording={stopRecording}
          isProcessingText={isUploadingImages}
          onImagesPaste={handleImagesPaste}
          onRemoveImage={handleRemoveImage}
          pendingImages={pendingImages}
          imageError={imageError}
          onRetryImageUpload={handleRetryImageUpload}
          onClearImageError={handleClearImageError}
        />
      </div>
      <DragOverlay>
        {activeDragTodo ? (
          <div className="rounded-lg border bg-card px-4 py-3 shadow-lg">
            {activeDragTodo.content}
          </div>
        ) : null}
      </DragOverlay>
      <ImagePreviewModal
        images={selectedImages}
        initialIndex={selectedImageIndex}
        open={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
      />
    </DndContext>
  );
}
