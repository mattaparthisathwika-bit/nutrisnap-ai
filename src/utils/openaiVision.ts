import {
  MacroResult,
  OPENAI_API_URL,
  buildOpenAIBody,
  extractOpenAIText,
  parseVisionResponse,
} from "./openaiVision.shared";
import { throttledApiCall } from "./apiThrottling";
import { getCachedResult, cacheResult, hashImageData } from "./visionCache";

export type { MacroResult, FoodItem } from "./openaiVision.shared";

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export async function analyzeFoodImage(base64Image: string): Promise<MacroResult> {
  if (!API_KEY || API_KEY.includes("your_openai")) {
    throw new Error("Missing EXPO_PUBLIC_OPENAI_API_KEY in .env");
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
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(buildOpenAIBody(base64Image)),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = (data as { error?: { message?: string } }).error?.message;
        throw new Error(
          errorMsg || `OpenAI API error (${response.status})`
        );
      }

      const text = extractOpenAIText(data);
      return parseVisionResponse(text);
    },
    "analyzeFoodImage"
  );

  // Cache successful result
  await cacheResult(imageHash, result);
  return result;
}
