/**
 * Demo / fallback food analysis — matches descriptions from AI captions
 * or uses a stable hash when no vision API is configured.
 */

import { MacroResult, FoodItem } from "./huggingfaceVision.shared";
import { hashImageData } from "./visionCache";

export type { MacroResult, FoodItem };

const FOOD_DATABASE: Record<string, MacroResult> = {
  pizza: {
    foodName: "Pizza with Cheese",
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 10,
    fiber: 2,
    servingSize: "2 slices (200g)",
    confidence: "high",
    items: [{ name: "Pizza", calories: 285, protein: 12, carbs: 36, fat: 10 }],
  },
  burger: {
    foodName: "Hamburger with Fries",
    calories: 540,
    protein: 25,
    carbs: 45,
    fat: 28,
    fiber: 3,
    servingSize: "1 burger + fries",
    confidence: "high",
    items: [
      { name: "Burger", calories: 354, protein: 17, carbs: 31, fat: 17 },
      { name: "Fries", calories: 186, protein: 3, carbs: 14, fat: 11 },
    ],
  },
  salad: {
    foodName: "Caesar Salad",
    calories: 280,
    protein: 15,
    carbs: 12,
    fat: 18,
    fiber: 3,
    servingSize: "1 bowl (300g)",
    confidence: "high",
    items: [
      { name: "Lettuce & Veggies", calories: 80, protein: 3, carbs: 12, fat: 1 },
      { name: "Chicken", calories: 140, protein: 26, carbs: 0, fat: 3 },
      { name: "Dressing", calories: 60, protein: 0, carbs: 0, fat: 6 },
    ],
  },
  pasta: {
    foodName: "Spaghetti Carbonara",
    calories: 469,
    protein: 30,
    carbs: 49,
    fat: 17,
    fiber: 2,
    servingSize: "1 plate (400g)",
    confidence: "high",
    items: [
      { name: "Spaghetti", calories: 350, protein: 12, carbs: 70, fat: 2 },
      { name: "Bacon & Egg Sauce", calories: 119, protein: 18, carbs: 0, fat: 15 },
    ],
  },
  rice: {
    foodName: "Rice with Vegetables",
    calories: 320,
    protein: 8,
    carbs: 60,
    fat: 3,
    fiber: 4,
    servingSize: "1 cup cooked",
    confidence: "high",
    items: [
      { name: "Rice", calories: 260, protein: 5, carbs: 52, fat: 1 },
      { name: "Vegetables", calories: 60, protein: 3, carbs: 8, fat: 2 },
    ],
  },
  sushi: {
    foodName: "Salmon Sushi Roll",
    calories: 350,
    protein: 18,
    carbs: 48,
    fat: 8,
    fiber: 2,
    servingSize: "8 pieces",
    confidence: "medium",
    items: [{ name: "Salmon Roll", calories: 350, protein: 18, carbs: 48, fat: 8 }],
  },
  chicken: {
    foodName: "Grilled Chicken Plate",
    calories: 420,
    protein: 42,
    carbs: 18,
    fat: 16,
    fiber: 3,
    servingSize: "1 plate",
    confidence: "medium",
    items: [
      { name: "Grilled Chicken", calories: 280, protein: 35, carbs: 0, fat: 12 },
      { name: "Vegetables", calories: 140, protein: 7, carbs: 18, fat: 4 },
    ],
  },
};

const FOOD_KEYWORDS: { id: keyof typeof FOOD_DATABASE; words: string[] }[] = [
  { id: "pizza", words: ["pizza", "pepperoni", "margherita", "mozzarella pie", "flatbread"] },
  { id: "burger", words: ["burger", "hamburger", "cheeseburger", "beef patty", "fast food sandwich"] },
  { id: "pasta", words: ["pasta", "spaghetti", "carbonara", "penne", "fettuccine", "noodle", "noodles", "macaroni"] },
  { id: "rice", words: ["rice", "fried rice", "biryani", "risotto", "pilaf", "bowl of rice"] },
  { id: "salad", words: ["salad", "lettuce", "caesar", "greens", "coleslaw"] },
  { id: "sushi", words: ["sushi", "sashimi", "maki", "nigiri", "poke bowl", "salmon roll"] },
  { id: "chicken", words: ["chicken", "grilled chicken", "roast chicken", "fried chicken", "wings"] },
];

export function matchDescriptionToFood(description: string): MacroResult | null {
  const text = description.toLowerCase();
  for (const { id, words } of FOOD_KEYWORDS) {
    if (words.some((word) => text.includes(word))) {
      const base = FOOD_DATABASE[id];
      return {
        ...base,
        foodName: capitalizeDescription(description) || base.foodName,
        confidence: "high",
      };
    }
  }
  return null;
}

function capitalizeDescription(text: string): string {
  const cleaned = text.replace(/[.!?]+$/, "").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function hashPickFood(base64Image: string): MacroResult {
  const foods = Object.values(FOOD_DATABASE);
  const hash = hashImageData(base64Image);
  const index =
    Math.abs(hash.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % foods.length;
  return { ...foods[index], confidence: "low" };
}

export async function analyzeFoodImageDemo(
  base64Image: string,
  description?: string
): Promise<MacroResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (description) {
    const matched = matchDescriptionToFood(description);
    if (matched) return matched;

    return {
      foodName: capitalizeDescription(description) || "Detected Meal",
      calories: 400,
      protein: 20,
      carbs: 40,
      fat: 15,
      fiber: 3,
      servingSize: "1 serving",
      confidence: "medium",
      items: [
        {
          name: capitalizeDescription(description) || "Main dish",
          calories: 400,
          protein: 20,
          carbs: 40,
          fat: 15,
        },
      ],
    };
  }

  return hashPickFood(base64Image);
}

export function isDemoModeOnly(): boolean {
  const gemini = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const openai = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const hf = process.env.EXPO_PUBLIC_HF_API_KEY;
  const hasKey = (k?: string) => !!k && !k.includes("your_") && k.length > 8;
  return !hasKey(gemini) && !hasKey(openai) && !hasKey(hf);
}
