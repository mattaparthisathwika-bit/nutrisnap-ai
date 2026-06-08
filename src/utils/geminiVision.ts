import {
  MacroResult,
  GEMINI_API_URL,
  buildGeminiBody,
  extractGeminiText,
  parseVisionResponse,
} from "./geminiVision.shared";
import { throttledApiCall } from "./apiThrottling";
import { getCachedResult, cacheResult, hashImageData } from "./visionCache";

export type { MacroResult, FoodItem } from "./geminiVision.shared";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function analyzeFoodImage(base64Image: string): Promise<MacroResult> {
  if (!API_KEY || API_KEY.includes("your_gemini")) {
    throw new Error(
      "Missing EXPO_PUBLIC_GEMINI_API_KEY in .env. Get free key at: https://aistudio.google.com/apikey"
    );
  }

  // Check cache first
  const imageHash = hashImageData(base64Image);
  const cachedResult = await getCachedResult(imageHash);
  if (cachedResult) {
    return cachedResult;
  }

  // Make throttled API call with retry logic
  const result = await throttledApiCall(
    async () => {
      const response = await fetch(
        `${GEMINI_API_URL}?key=${encodeURIComponent(API_KEY)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildGeminiBody(base64Image)),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          (data as { error?: { message?: string } }).error?.message ||
          `Gemini API error (${response.status})`;
        throw new Error(errorMsg);
      }

      const text = extractGeminiText(data);
      if (!text) {
        throw new Error("No response from Gemini API");
      }

      return parseVisionResponse(text);
    },
    "analyzeFoodImage (Gemini)"
  );

  // Cache successful result
  await cacheResult(imageHash, result);
  return result;
}
