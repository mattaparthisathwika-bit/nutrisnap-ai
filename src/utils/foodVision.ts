import { MacroResult } from "./openaiVision.shared";
import { analyzeFoodImageDemo, isDemoModeOnly } from "./demoVision";
import { analyzeFoodImage as geminiAnalyze } from "./geminiVision";
import { analyzeFoodImage as openaiAnalyze } from "./openaiVision";
import { analyzeFoodImage as hfAnalyze } from "./huggingfaceVision";

export type { MacroResult, FoodItem } from "./openaiVision.shared";

function hasKey(value?: string): boolean {
  return !!value && !value.includes("your_") && value.length > 8;
}

export async function analyzeFoodImage(base64Image: string): Promise<MacroResult> {
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const hfKey = process.env.EXPO_PUBLIC_HF_API_KEY;

  if (hasKey(geminiKey)) {
    return geminiAnalyze(base64Image);
  }

  if (hasKey(openaiKey)) {
    return openaiAnalyze(base64Image);
  }

  if (hasKey(hfKey)) {
    return hfAnalyze(base64Image);
  }

  return analyzeFoodImageDemo(base64Image);
}

export { isDemoModeOnly };
