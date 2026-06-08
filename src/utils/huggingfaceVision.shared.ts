/**
 * HuggingFace Inference Providers — vision via chat completions API.
 * BLIP/moondream are no longer on hf-inference; use a VLM like Aya Vision.
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

export const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

export const HF_VISION_MODEL =
  process.env.EXPO_PUBLIC_HF_VISION_MODEL || "CohereLabs/aya-vision-32b";

export const HF_VISION_PROMPT =
  "What food dish is shown in this image? Answer with only the food name in 5 words or less.";

export function toImageDataUrl(base64Image: string): string {
  return base64Image.startsWith("data:")
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;
}

export function buildVisionChatBody(base64Image: string) {
  return {
    model: HF_VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: HF_VISION_PROMPT },
          { type: "image_url", image_url: { url: toImageDataUrl(base64Image) } },
        ],
      },
    ],
    max_tokens: 32,
  };
}

export function extractChatText(data: unknown): string {
  const obj = data as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  const content = obj?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}

export function formatHFError(status: number, body: unknown): string {
  const obj = body as { error?: string | { message?: string } };
  const message =
    typeof obj?.error === "string"
      ? obj.error
      : typeof obj?.error === "object" && obj.error?.message
        ? obj.error.message
        : `HuggingFace API error (${status})`;

  if (status === 403 && message.includes("sufficient permissions")) {
    return (
      "HuggingFace token lacks Inference permission. Create a new token at " +
      "huggingface.co/settings/tokens with 'Make calls to Inference Providers' enabled, " +
      "then update .env and restart npm start + npm run proxy."
    );
  }

  if (status === 400 && message.includes("not supported by provider")) {
    return (
      `Vision model "${HF_VISION_MODEL}" is not available. ` +
      "Set EXPO_PUBLIC_HF_VISION_MODEL=CohereLabs/aya-vision-32b in .env and restart."
    );
  }

  if (status === 400 && message.includes("not supported by any provider")) {
    return (
      "No vision provider enabled on your HuggingFace account. " +
      "Enable Cohere at huggingface.co/settings/inference-providers, or use Gemini instead."
    );
  }

  if (status === 401) {
    return "Invalid HuggingFace token. Check EXPO_PUBLIC_HF_API_KEY in .env.";
  }

  if (status === 503) {
    return "HuggingFace model is loading. Wait 30 seconds and try again.";
  }

  return message;
}

export function formatFetchError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const cause =
    error instanceof Error && "cause" in error
      ? String((error as Error & { cause?: unknown }).cause)
      : "";

  if (message === "fetch failed" || cause.includes("ENOTFOUND")) {
    return (
      "Cannot reach HuggingFace API. Restart npm run proxy after saving .env, " +
      "and ensure your token has Inference Providers permission."
    );
  }

  return message || "HuggingFace request failed.";
}
