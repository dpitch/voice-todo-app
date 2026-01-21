import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

const CLASSIFICATION_PROMPT = `Tu es un assistant qui classe des to-dos en français.
Pour chaque to-do, détermine:
1. category: un thème court (ex: "Travail", "Tech", "Perso", "À visiter", "Courses", "Admin"...)
2. priority: "high" (urgent/deadline proche), "medium" (normal), "low" (quand j'ai le temps)

Réponds UNIQUEMENT en JSON: {"category": "...", "priority": "..."}

To-do à classer: "{content}"`;

export const classifyTodo = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const prompt = CLASSIFICATION_PROMPT.replace("{content}", args.content);

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
    };
  },
});

export const processVoiceTodo = action({
  args: {
    audioData: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Transcribe audio to text
    const transcription = await ctx.runAction(api.ai.transcribeAudio, {
      audioData: args.audioData,
    });

    if (!transcription.text || transcription.text.trim() === "") {
      throw new Error("Transcription resulted in empty text");
    }

    // Step 2: Classify the todo (category + priority)
    const classification = await ctx.runAction(api.ai.classifyTodo, {
      content: transcription.text,
    });

    // Step 3: Create the todo
    const todoId = await ctx.runMutation(api.todos.create, {
      content: transcription.text,
      category: classification.category,
      priority: classification.priority,
      isCompleted: false,
      createdAt: Date.now(),
    });

    return {
      todoId,
      content: transcription.text,
      category: classification.category,
      priority: classification.priority,
    };
  },
});
