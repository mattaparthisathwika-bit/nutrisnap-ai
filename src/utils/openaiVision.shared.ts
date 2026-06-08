export interface MacroResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  confidence: "high" | "medium" | "low";
  items: FoodItem[];
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const VISION_PROMPT = `Analyze food image. Return ONLY JSON (no markdown).
{
  "foodName": "meal",
  "calories": <int>,
  "protein": <int g>,
  "carbs": <int g>,
  "fat": <int g>,
  "fiber": <int g>,
  "servingSize": "e.g. 1 plate",
  "confidence": "high|medium|low",
  "items": [{"name": "food", "calories": <int>, "protein": <int>, "carbs": <int>, "fat": <int>}]
}
If no food: {"error": "No food"}`;

export const OPENAI_MODEL =
  process.env.EXPO_PUBLIC_OPENAI_MODEL || "gpt-4o";

export const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export function parseVisionResponse(text: string): MacroResult {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.error) {
    throw new Error(parsed.error);
  }

  return parsed as MacroResult;
}

export function buildOpenAIBody(base64Image: string) {
  return {
    model: OPENAI_MODEL,
    max_tokens: 300,  // Reduced from 500, JSON response is typically ~150 tokens
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: "low",  // Keeps token usage low (fixed at ~85 tokens for low detail)
            },
          },
          {
            type: "text",
            text: VISION_PROMPT,
          },
        ],
      },
    ],
  };
}

export function extractOpenAIText(data: {
  choices?: Array<{ message?: { content?: string } }>;
}): string {
  return data.choices?.[0]?.message?.content?.trim() || "";
}
