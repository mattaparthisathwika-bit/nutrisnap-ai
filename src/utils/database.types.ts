export interface DiaryEntry {
  id: number;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving_size: string;
  image_uri?: string;
  created_at: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  hydration_goal_ml: number;
  fiber_goal: number;
  sugar_limit: number;
}

export interface UserGoals extends DailyGoals {
  streak: number;
}

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  profile_image_uri?: string;
  daily_goal_note?: string;
}
