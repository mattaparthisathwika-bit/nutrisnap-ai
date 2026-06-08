import {
  MacroResult,
  HF_CHAT_URL,
  buildVisionChatBody,
  extractChatText,
  formatHFError,
  formatFetchError,
} from "./huggingfaceVision.shared";
import { analyzeFoodImageDemo } from "./demoVision";
import { throttledApiCall } from "./apiThrottling";
import { getCachedResult, cacheResult, hashImageData } from "./visionCache";

export type { MacroResult, FoodItem } from "./huggingfaceVision.shared";

const API_KEY = process.env.EXPO_PUBLIC_HF_API_KEY;

export async function analyzeFoodImage(base64Image: string): Promise<MacroResult> {
  if (!API_KEY || API_KEY.includes("your_")) {
    throw new Error(
      "Missing EXPO_PUBLIC_HF_API_KEY in .env. Get a free key at: https://huggingface.co/settings/tokens"
    );
  }

  const imageHash = hashImageData(base64Image);
  const cachedResult = await getCachedResult(imageHash);
  if (cachedResult) {
    return cachedResult;
  }

  const result = await throttledApiCall(
    async () => {
      let response: Response;
      try {
        response = await fetch(HF_CHAT_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildVisionChatBody(base64Image)),
        });
      } catch (error) {
        throw new Error(formatFetchError(error));
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(formatHFError(response.status, data));
      }

      const text = extractChatText(data);
      if (!text) {
        throw new Error("No food description returned from HuggingFace.");
      }

      return analyzeFoodImageDemo(base64Image, text);
    },
    "analyzeFoodImage (HuggingFace)"
  );

  await cacheResult(imageHash, result);
  return result;
}
