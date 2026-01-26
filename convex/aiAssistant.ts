import { action } from "./_generated/server";
import { v } from "convex/values";

// Helper to extract JSON from potentially markdown-wrapped responses
function extractJson(text: string): string {
  // Check if the response is wrapped in markdown code fences
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  // Return as-is if no code fences found
  return text.trim();
}

// Générer une suggestion IA pour aider à accomplir la tâche
export const generateSuggestion = action({
  args: {
    todoContent: v.string(),
    todoCategory: v.string(),
    currentNotes: v.string(),
  },
  handler: async (ctx, args): Promise<{ suggestion: string }> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const prompt = `Tu es un assistant de productivité concis et utile.

Contexte:
- Tâche: "${args.todoContent}"
- Catégorie: ${args.todoCategory}
- Notes de l'utilisateur: "${args.currentNotes || "(aucune note pour l'instant)"}"

Génère UNE suggestion courte (1-2 phrases max) pour aider l'utilisateur à avancer sur cette tâche.

La suggestion doit être:
- Pratique et actionnable
- Adaptée au contexte des notes si présentes
- En français
- Encourageante mais pas condescendante

Exemples de bonnes suggestions:
- "Tu pourrais commencer par lister les 3 sous-tâches principales."
- "As-tu vérifié si une documentation existe pour ce projet ?"
- "Pense à définir un critère de succès clair avant de commencer."

Réponds UNIQUEMENT en JSON: {"suggestion": "..."}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
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

    try {
      const parsed = JSON.parse(extractJson(textContent));
      return { suggestion: parsed.suggestion || "Commence par définir ta première action." };
    } catch {
      // Si le parsing échoue, retourne une suggestion par défaut
      return { suggestion: "Commence par définir ta première action." };
    }
  },
});
