/**
 * Local LLaVA Vision API via Ollama
 * Completely FREE, no quotas, runs offline
 */

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

// Local Ollama server endpoint
export const LOCAL_MODEL_URL = "http://localhost:11434/api/generate";
export const LOCAL_MODEL_NAME = "llava";

export function parseVisionResponse(text: string): MacroResult {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.error) {
    throw new Error(parsed.error);
  }

  return parsed as MacroResult;
}

export function buildLocalModelBody(base64Image: string) {
  return {
    model: LOCAL_MODEL_NAME,
    prompt: VISION_PROMPT,
    images: [base64Image],
    stream: false,
  };
}

export function extractLocalModelText(data: {
  response?: string;
}): string {
  return data.response?.trim() || "";
}
