import {
  MacroResult,
  LOCAL_MODEL_URL,
  buildLocalModelBody,
  extractLocalModelText,
  parseVisionResponse,
} from "./localVision.shared";
import { throttledApiCall } from "./apiThrottling";
import { getCachedResult, cacheResult, hashImageData } from "./visionCache";

export type { MacroResult, FoodItem } from "./localVision.shared";

export async function analyzeFoodImage(base64Image: string): Promise<MacroResult> {
  // Check cache first
  const imageHash = hashImageData(base64Image);
  const cachedResult = await getCachedResult(imageHash);
  if (cachedResult) {
    return cachedResult;
  }

  // Make throttled API call with retry logic
  const result = await throttledApiCall(
    async () => {
      try {
        const response = await fetch(LOCAL_MODEL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildLocalModelBody(base64Image)),
        });

        if (!response.ok) {
          throw new Error(
            `Local model error (${response.status}). Make sure Ollama is running: https://ollama.com/download`
          );
        }

        const data = await response.json();
        const text = extractLocalModelText(data);

        if (!text) {
          throw new Error("No response from local model");
        }

        return parseVisionResponse(text);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        
        if (errorMsg.includes("Failed to fetch") || errorMsg.includes("connect")) {
          throw new Error(
            "Cannot connect to Ollama. Make sure to:\n" +
            "1. Download Ollama from https://ollama.com/download\n" +
            "2. Run: ollama run llava\n" +
            "3. Keep it running in the background\n" +
            "4. Then reload this app"
          );
        }
        
        throw error;
      }
    },
    "analyzeFoodImage (Local)"
  );

  // Cache successful result
  await cacheResult(imageHash, result);
  return result;
}
