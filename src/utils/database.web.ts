import { DiaryEntry, DailyGoals, UserGoals, UserProfile } from "./database.types";
import { prepareWebImageUri } from "./webImageStorage";

export type { DiaryEntry, DailyGoals, UserGoals, UserProfile };

const STORAGE_KEY = "nutrisnap_web_store";

const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  hydration_goal_ml: 3000,
  fiber_goal: 35,
  sugar_limit: 25,
};

const DEFAULT_PROFILE: UserProfile = {
  name: "NutriSnap User",
  email: "",
  age: 28,
  height_cm: 170,
  weight_kg: 70,
  activity_level: "moderate",
};

interface WebStore {
  entries: DiaryEntry[];
  goals: DailyGoals & { streak: number; last_logged_date?: string };
  hydration: Record<string, number>;
  profile: UserProfile;
  nextId: number;
}

function defaultStore(): WebStore {
  return {
    entries: [],
    goals: { ...DEFAULT_GOALS, streak: 0 },
    hydration: {},
    profile: { ...DEFAULT_PROFILE },
    nextId: 1,
  };
}

function loadStore(): WebStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WebStore>;
      return {
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
        goals: { ...DEFAULT_GOALS, streak: 0, ...(parsed.goals ?? {}) },
        hydration: parsed.hydration ?? {},
        profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
        nextId: typeof parsed.nextId === "number" ? parsed.nextId : 1,
      };
    }
  } catch (error) {
    console.error("Failed to load web store:", error);
  }
  return defaultStore();
}

function stripLargeImages(store: WebStore): WebStore {
  return {
    ...store,
    entries: store.entries.map((entry) => ({
      ...entry,
      image_uri:
        entry.image_uri && entry.image_uri.length > 48_000 ? undefined : entry.image_uri,
    })),
    profile: {
      ...store.profile,
      profile_image_uri:
        store.profile.profile_image_uri && store.profile.profile_image_uri.length > 48_000
          ? undefined
          : store.profile.profile_image_uri,
    },
  };
}

function saveStore(store: WebStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return;
  } catch (error) {
    console.warn("Full web store save failed, retrying without large images:", error);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stripLargeImages(store)));
    return;
  } catch (error) {
    console.error("Failed to save web store:", error);
    throw new Error(
      "Could not save meal. Browser storage is full — clear site data for localhost and try again."
    );
  }
}

export async function initDatabase(): Promise<void> {
  const store = loadStore();
  saveStore(store);
}

export async function addDiaryEntry(
  entry: Omit<DiaryEntry, "id" | "created_at">,
  imageUri?: string
): Promise<number> {
  const store = loadStore();
  const id = store.nextId++;
  const image_uri = await prepareWebImageUri(imageUri);

  store.entries.push({
    ...entry,
    id,
    fiber: entry.fiber || 0,
    image_uri,
    created_at: new Date().toISOString(),
  });
  await updateStreakInStore(store, entry.date);
  saveStore(store);
  return id;
}

export async function getDiaryEntriesByDate(date: string): Promise<DiaryEntry[]> {
  return loadStore()
    .entries.filter((e) => e.date === date)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function getLastMeal(date: string): Promise<DiaryEntry | null> {
  const entries = await getDiaryEntriesByDate(date);
  return entries.length ? entries[entries.length - 1] : null;
}

export async function deleteDiaryEntry(id: number): Promise<void> {
  const store = loadStore();
  store.entries = store.entries.filter((e) => e.id !== id);
  saveStore(store);
}

export async function getDailyTotals(date: string) {
  const entries = await getDiaryEntriesByDate(date);
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      fiber: acc.fiber + e.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export async function getWeeklyData(startDate: string) {
  const byDate = new Map<string, number>();
  for (const e of loadStore().entries) {
    if (e.date >= startDate) {
      byDate.set(e.date, (byDate.get(e.date) || 0) + e.calories);
    }
  }
  return Array.from(byDate.entries())
    .map(([date, total_calories]) => ({ date, total_calories }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getLoggedDates(startDate: string): Promise<string[]> {
  const dates = new Set<string>();
  for (const e of loadStore().entries) {
    if (e.date >= startDate) dates.add(e.date);
  }
  return Array.from(dates).sort();
}

export async function getUserGoals(): Promise<UserGoals> {
  const { goals } = loadStore();
  return {
    calories: goals.calories ?? DEFAULT_GOALS.calories,
    protein: goals.protein ?? DEFAULT_GOALS.protein,
    carbs: goals.carbs ?? DEFAULT_GOALS.carbs,
    fat: goals.fat ?? DEFAULT_GOALS.fat,
    hydration_goal_ml: goals.hydration_goal_ml ?? DEFAULT_GOALS.hydration_goal_ml,
    fiber_goal: goals.fiber_goal ?? DEFAULT_GOALS.fiber_goal,
    sugar_limit: goals.sugar_limit ?? DEFAULT_GOALS.sugar_limit,
    streak: goals.streak ?? 0,
  };
}

export async function updateUserGoals(goals: Partial<DailyGoals>): Promise<void> {
  const store = loadStore();
  store.goals = { ...store.goals, ...goals };
  saveStore(store);
}

export async function getHydration(date: string): Promise<number> {
  return loadStore().hydration[date] ?? 0;
}

export async function addHydration(date: string, amountMl: number): Promise<number> {
  const store = loadStore();
  const next = (store.hydration[date] ?? 0) + amountMl;
  store.hydration[date] = next;
  saveStore(store);
  return next;
}

export async function getUserProfile(): Promise<UserProfile> {
  return { ...DEFAULT_PROFILE, ...loadStore().profile };
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const store = loadStore();
  const profile_image_uri = updates.profile_image_uri
    ? await prepareWebImageUri(updates.profile_image_uri)
    : updates.profile_image_uri;

  store.profile = {
    ...DEFAULT_PROFILE,
    ...store.profile,
    ...updates,
    ...(profile_image_uri !== undefined ? { profile_image_uri } : {}),
  };
  saveStore(store);
}

async function updateStreakInStore(store: WebStore, loggedDate: string): Promise<void> {
  const yesterday = new Date(Date.parse(loggedDate) - 86400000).toISOString().split("T")[0];
  let newStreak = store.goals.streak;
  if (store.goals.last_logged_date === yesterday) {
    newStreak += 1;
  } else if (store.goals.last_logged_date !== loggedDate) {
    newStreak = 1;
  }
  store.goals.streak = newStreak;
  store.goals.last_logged_date = loggedDate;
}
