import { analyzeFoodImageDemo, type MacroResult } from "./demoVision";

export type { MacroResult, FoodItem } from "./demoVision";

// Demo mode - no API key needed, works immediately
export async function analyzeFoodImage(base64Image: string): Promise<MacroResult> {
  return analyzeFoodImageDemo(base64Image);
}


