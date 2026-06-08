import { MacroResult } from "./huggingfaceVision.shared";
import { analyzeFoodImageDemo } from "./demoVision";

export type { MacroResult, FoodItem } from "./huggingfaceVision.shared";

const PROXY_URL = process.env.EXPO_PUBLIC_HF_PROXY_URL || "http://localhost:3001";

export async function analyzeFoodImage(base64Image: string): Promise<MacroResult> {
  const apiKey = process.env.EXPO_PUBLIC_HF_API_KEY;
  if (!apiKey || apiKey.includes("your_")) {
    throw new Error("Missing EXPO_PUBLIC_HF_API_KEY in .env");
  }

  let response: Response;
  try {
    response = await fetch(`${PROXY_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image }),
    });
  } catch {
    throw new Error(
      "Cannot reach vision proxy. Run npm run proxy in a second terminal, then try again."
    );
  }

  let data: { error?: string; text?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error(`Vision proxy returned invalid response (${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Vision proxy error (${response.status})`);
  }

  const description = (data.text as string) || "";
  if (!description.trim()) {
    throw new Error("No description returned from vision model.");
  }

  return analyzeFoodImageDemo(base64Image, description);
}
