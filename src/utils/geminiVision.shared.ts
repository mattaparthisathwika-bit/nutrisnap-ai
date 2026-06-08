/**
 * Google Gemini Vision API integration (FREE - 60 requests/minute)
 * Replaces OpenAI as the free alternative for food analysis
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

export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
export const GEMINI_MODEL = "gemini-2.0-flash";

export function parseVisionResponse(text: string): MacroResult {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.error) {
    throw new Error(parsed.error);
  }

  return parsed as MacroResult;
}

export function buildGeminiBody(base64Image: string) {
  return {
    contents: [
      {
        parts: [
          {
            text: VISION_PROMPT,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 300,
    },
  };
}

export function extractGeminiText(data: {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}): string {
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
  );
}
