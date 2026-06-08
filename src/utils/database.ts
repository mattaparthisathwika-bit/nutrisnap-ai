import * as SQLite from "expo-sqlite";
import { DiaryEntry, DailyGoals, UserGoals, UserProfile } from "./database.types";

export type { DiaryEntry, DailyGoals, UserGoals, UserProfile };

const DB_NAME = "nutrisnap.db";
const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  hydration_goal_ml: 3000,
  fiber_goal: 35,
  sugar_limit: 25,
};

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      food_name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein INTEGER NOT NULL,
      carbs INTEGER NOT NULL,
      fat INTEGER NOT NULL,
      fiber INTEGER DEFAULT 0,
      serving_size TEXT,
      image_uri TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      calories INTEGER DEFAULT 2000,
      protein INTEGER DEFAULT 150,
      carbs INTEGER DEFAULT 200,
      fat INTEGER DEFAULT 65,
      hydration_goal_ml INTEGER DEFAULT 3000,
      fiber_goal INTEGER DEFAULT 35,
      sugar_limit INTEGER DEFAULT 25,
      streak INTEGER DEFAULT 0,
      last_logged_date TEXT
    );

    CREATE TABLE IF NOT EXISTS hydration_log (
      date TEXT PRIMARY KEY,
      amount_ml INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT DEFAULT 'NutriSnap User',
      email TEXT DEFAULT '',
      age INTEGER DEFAULT 28,
      height_cm INTEGER DEFAULT 170,
      weight_kg INTEGER DEFAULT 70,
      activity_level TEXT DEFAULT 'moderate',
      profile_image_uri TEXT,
      daily_goal_note TEXT DEFAULT ''
    );

    INSERT OR IGNORE INTO user_goals (id, calories, protein, carbs, fat, hydration_goal_ml, fiber_goal, sugar_limit)
    VALUES (1, 2000, 150, 200, 65, 3000, 35, 25);

    INSERT OR IGNORE INTO user_profile (id, name, email, age, height_cm, weight_kg, activity_level)
    VALUES (1, 'NutriSnap User', '', 28, 170, 70, 'moderate');
  `);

  await migrateGoalsColumns();
  await ensureProfileRow();
}

async function ensureProfileRow() {
  const row = await db.getFirstAsync<{ id: number }>(`SELECT id FROM user_profile WHERE id = 1`);
  if (!row) {
    await db.runAsync(
      `INSERT INTO user_profile (id, name, email, age, height_cm, weight_kg, activity_level)
       VALUES (1, 'NutriSnap User', '', 28, 170, 70, 'moderate')`
    );
  }
}

async function migrateGoalsColumns() {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(user_goals)`);
  const names = new Set(columns.map((c) => c.name));
  if (!names.has("hydration_goal_ml")) {
    await db.execAsync(`ALTER TABLE user_goals ADD COLUMN hydration_goal_ml INTEGER DEFAULT 3000`);
  }
  if (!names.has("fiber_goal")) {
    await db.execAsync(`ALTER TABLE user_goals ADD COLUMN fiber_goal INTEGER DEFAULT 35`);
  }
  if (!names.has("sugar_limit")) {
    await db.execAsync(`ALTER TABLE user_goals ADD COLUMN sugar_limit INTEGER DEFAULT 25`);
  }
  await db.execAsync(`
    UPDATE user_goals SET
      hydration_goal_ml = COALESCE(hydration_goal_ml, 3000),
      fiber_goal = COALESCE(fiber_goal, 35),
      sugar_limit = COALESCE(sugar_limit, 25)
    WHERE id = 1
  `);
}

export async function addDiaryEntry(
  entry: Omit<DiaryEntry, "id" | "created_at">,
  imageUri?: string
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO diary_entries (date, meal_type, food_name, calories, protein, carbs, fat, fiber, serving_size, image_uri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.date,
      entry.meal_type,
      entry.food_name,
      entry.calories,
      entry.protein,
      entry.carbs,
      entry.fat,
      entry.fiber || 0,
      entry.serving_size,
      imageUri || null,
    ]
  );
  await updateStreak(entry.date);
  return result.lastInsertRowId;
}

export async function getDiaryEntriesByDate(date: string): Promise<DiaryEntry[]> {
  return db.getAllAsync<DiaryEntry>(
    `SELECT * FROM diary_entries WHERE date = ? ORDER BY created_at ASC`,
    [date]
  );
}

export async function getLastMeal(date: string): Promise<DiaryEntry | null> {
  return (
    (await db.getFirstAsync<DiaryEntry>(
      `SELECT * FROM diary_entries WHERE date = ? ORDER BY created_at DESC LIMIT 1`,
      [date]
    )) ?? null
  );
}

export async function deleteDiaryEntry(id: number): Promise<void> {
  await db.runAsync(`DELETE FROM diary_entries WHERE id = ?`, [id]);
}

export async function getDailyTotals(date: string) {
  const result = await db.getFirstAsync<{
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    total_fiber: number;
  }>(
    `SELECT SUM(calories) as total_calories, SUM(protein) as total_protein,
      SUM(carbs) as total_carbs, SUM(fat) as total_fat, SUM(fiber) as total_fiber
     FROM diary_entries WHERE date = ?`,
    [date]
  );
  return {
    calories: result?.total_calories || 0,
    protein: result?.total_protein || 0,
    carbs: result?.total_carbs || 0,
    fat: result?.total_fat || 0,
    fiber: result?.total_fiber || 0,
  };
}

export async function getWeeklyData(startDate: string) {
  return db.getAllAsync<{ date: string; total_calories: number }>(
    `SELECT date, SUM(calories) as total_calories FROM diary_entries
     WHERE date >= ? GROUP BY date ORDER BY date ASC`,
    [startDate]
  );
}

export async function getLoggedDates(startDate: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT DISTINCT date FROM diary_entries WHERE date >= ? ORDER BY date ASC`,
    [startDate]
  );
  return rows.map((r) => r.date);
}

export async function getUserGoals(): Promise<UserGoals> {
  const result = await db.getFirstAsync<UserGoals>(
    `SELECT calories, protein, carbs, fat, hydration_goal_ml, fiber_goal, sugar_limit, streak
     FROM user_goals WHERE id = 1`
  );
  if (!result) return { ...DEFAULT_GOALS, streak: 0 };
  return {
    calories: result.calories ?? DEFAULT_GOALS.calories,
    protein: result.protein ?? DEFAULT_GOALS.protein,
    carbs: result.carbs ?? DEFAULT_GOALS.carbs,
    fat: result.fat ?? DEFAULT_GOALS.fat,
    hydration_goal_ml: result.hydration_goal_ml ?? DEFAULT_GOALS.hydration_goal_ml,
    fiber_goal: result.fiber_goal ?? DEFAULT_GOALS.fiber_goal,
    sugar_limit: result.sugar_limit ?? DEFAULT_GOALS.sugar_limit,
    streak: result.streak ?? 0,
  };
}

export async function updateUserGoals(goals: Partial<DailyGoals>): Promise<void> {
  const fields = Object.keys(goals).map((k) => `${k} = ?`).join(", ");
  const values = Object.values(goals);
  await db.runAsync(`UPDATE user_goals SET ${fields} WHERE id = 1`, values);
}

export async function getHydration(date: string): Promise<number> {
  const row = await db.getFirstAsync<{ amount_ml: number }>(
    `SELECT amount_ml FROM hydration_log WHERE date = ?`,
    [date]
  );
  return row?.amount_ml ?? 0;
}

export async function addHydration(date: string, amountMl: number): Promise<number> {
  const current = await getHydration(date);
  const next = current + amountMl;
  await db.runAsync(
    `INSERT INTO hydration_log (date, amount_ml) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET amount_ml = ?`,
    [date, next, next]
  );
  return next;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "NutriSnap User",
  email: "",
  age: 28,
  height_cm: 170,
  weight_kg: 70,
  activity_level: "moderate",
};

export async function getUserProfile(): Promise<UserProfile> {
  const row = await db.getFirstAsync<UserProfile>(
    `SELECT name, email, age, height_cm, weight_kg, activity_level, profile_image_uri, daily_goal_note
     FROM user_profile WHERE id = 1`
  );
  if (!row) return DEFAULT_PROFILE;
  return {
    name: row.name ?? DEFAULT_PROFILE.name,
    email: row.email ?? DEFAULT_PROFILE.email,
    age: row.age ?? DEFAULT_PROFILE.age,
    height_cm: row.height_cm ?? DEFAULT_PROFILE.height_cm,
    weight_kg: row.weight_kg ?? DEFAULT_PROFILE.weight_kg,
    activity_level: row.activity_level ?? DEFAULT_PROFILE.activity_level,
    profile_image_uri: row.profile_image_uri,
    daily_goal_note: row.daily_goal_note ?? "",
  };
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  await ensureProfileRow();
  const current = await getUserProfile();
  const merged = { ...current, ...updates };
  await db.runAsync(
    `INSERT INTO user_profile (id, name, email, age, height_cm, weight_kg, activity_level, profile_image_uri, daily_goal_note)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       email = excluded.email,
       age = excluded.age,
       height_cm = excluded.height_cm,
       weight_kg = excluded.weight_kg,
       activity_level = excluded.activity_level,
       profile_image_uri = excluded.profile_image_uri,
       daily_goal_note = excluded.daily_goal_note`,
    [
      merged.name,
      merged.email ?? "",
      merged.age,
      merged.height_cm,
      merged.weight_kg,
      merged.activity_level,
      merged.profile_image_uri ?? null,
      merged.daily_goal_note ?? "",
    ]
  );
}

async function updateStreak(loggedDate: string): Promise<void> {
  const goals = await db.getFirstAsync<{ streak: number; last_logged_date: string }>(
    `SELECT streak, last_logged_date FROM user_goals WHERE id = 1`
  );
  if (!goals) return;

  const yesterday = new Date(Date.parse(loggedDate) - 86400000).toISOString().split("T")[0];
  let newStreak = goals.streak;
  if (goals.last_logged_date === yesterday) {
    newStreak += 1;
  } else if (goals.last_logged_date !== loggedDate) {
    newStreak = 1;
  }
  await db.runAsync(
    `UPDATE user_goals SET streak = ?, last_logged_date = ? WHERE id = 1`,
    [newStreak, loggedDate]
  );
}
