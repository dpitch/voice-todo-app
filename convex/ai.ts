import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const transcribeAudio = action({
  args: {
    audioData: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    // Decode base64 audio data
    const binaryData = atob(args.audioData);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }

    // Create form data for the API request
    const formData = new FormData();
    const blob = new Blob([bytes], { type: "audio/webm" });
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { text: result.text };
  },
});

function buildClassificationPrompt(content: string, existingCategories: string[]): string {
  const categoriesListText = existingCategories.length > 0
    ? `\n\nCatégories existantes dans l'app: ${existingCategories.map(c => `"${c}"`).join(", ")}\nUtilise une de ces catégories si elle correspond bien. Sinon, crée une nouvelle catégorie appropriée.`
    : "";

  return `Tu es un assistant qui classe des to-dos en français.
Pour chaque to-do, détermine:
1. category: un thème court. Exemples typiques: "Travail", "Tech", "Perso", "À visiter", "Courses", "Admin", etc.
   - IMPORTANT: Si le to-do mentionne un projet spécifique (nom d'app, nom de projet, etc.), utilise ce nom comme catégorie.
   - Par exemple: "Ajouter une feature à RepNet" → category: "RepNet"
   - Par exemple: "Corriger le bug dans MyApp" → category: "MyApp"
2. priority: "high" (urgent/deadline proche), "medium" (normal), "low" (quand j'ai le temps)
3. cleanedContent: le texte du to-do NETTOYÉ en enlevant les mentions redondantes du projet/catégorie.
   - Enlève les préfixes comme "Pour RepNet:", "RepNet:", "Dans MyApp:", etc.
   - Enlève aussi les mentions redondantes à la fin comme "...pour RepNet", "...dans MyApp"
   - Garde le texte naturel et lisible
   - Exemples:
     - "Pour RepNet: déplacer la page de choix" → "Déplacer la page de choix"
     - "RepNet - ajouter un bouton" → "Ajouter un bouton"
     - "Corriger le bug dans RepNet" → "Corriger le bug"
     - "Acheter du pain" → "Acheter du pain" (pas de changement si pas de mention de catégorie)
${categoriesListText}

Réponds UNIQUEMENT en JSON: {"category": "...", "priority": "...", "cleanedContent": "..."}

To-do à classer: "${content}"`;
}

export const classifyTodo = action({
  args: {
    content: v.string(),
    existingCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const prompt = buildClassificationPrompt(args.content, args.existingCategories ?? []);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const textContent = result.content[0]?.text;

    if (!textContent) {
      throw new Error("No response from Claude API");
    }

    const parsed = JSON.parse(textContent);

    if (
      !parsed.category ||
      !["low", "medium", "high"].includes(parsed.priority)
    ) {
      throw new Error("Invalid classification response from Claude API");
    }

    return {
      category: parsed.category as string,
      priority: parsed.priority as "low" | "medium" | "high",
      cleanedContent: (parsed.cleanedContent as string) || args.content,
    };
  },
});

// Process a text todo (classify and create)
export const processTextTodo = action({
  args: {
    content: v.string(),
    existingCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<{
    todoId: string;
    content: string;
    category: string;
    priority: "low" | "medium" | "high";
  }> => {
    // Step 1: Classify the todo (category + priority + cleaned content)
    const classification: { 
      category: string; 
      priority: "low" | "medium" | "high";
      cleanedContent: string;
    } = await ctx.runAction(api.ai.classifyTodo, {
      content: args.content,
      existingCategories: args.existingCategories,
    });

    // Step 2: Create the todo with cleaned content
    const todoId: string = await ctx.runMutation(api.todos.create, {
      content: classification.cleanedContent,
      category: classification.category,
      priority: classification.priority,
      isCompleted: false,
      createdAt: Date.now(),
    });

    // Step 3: Ensure the category exists in the categories table
    await ctx.runMutation(api.todos.createCategory, {
      name: classification.category,
    });

    return {
      todoId,
      content: classification.cleanedContent,
      category: classification.category,
      priority: classification.priority,
    };
  },
});

export const processVoiceTodo = action({
  args: {
    audioData: v.string(),
    existingCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<{
    todoId: string;
    content: string;
    category: string;
    priority: "low" | "medium" | "high";
  }> => {
    // Step 1: Transcribe audio to text
    const transcription: { text: string } = await ctx.runAction(api.ai.transcribeAudio, {
      audioData: args.audioData,
    });

    if (!transcription.text || transcription.text.trim() === "") {
      throw new Error("Transcription resulted in empty text");
    }

    // Step 2: Classify the todo (category + priority + cleaned content)
    const classification: { 
      category: string; 
      priority: "low" | "medium" | "high";
      cleanedContent: string;
    } = await ctx.runAction(api.ai.classifyTodo, {
      content: transcription.text,
      existingCategories: args.existingCategories,
    });

    // Step 3: Create the todo with cleaned content
    const todoId: string = await ctx.runMutation(api.todos.create, {
      content: classification.cleanedContent,
      category: classification.category,
      priority: classification.priority,
      isCompleted: false,
      createdAt: Date.now(),
    });

    // Step 4: Ensure the category exists in the categories table
    await ctx.runMutation(api.todos.createCategory, {
      name: classification.category,
    });

    return {
      todoId,
      content: classification.cleanedContent,
      category: classification.category,
      priority: classification.priority,
    };
  },
});
