import { useState, useEffect, useCallback } from "react";
import {
  DiaryEntry,
  getDiaryEntriesByDate,
  getDailyTotals,
  getUserGoals,
  addDiaryEntry,
  deleteDiaryEntry,
  getHydration,
  addHydration,
} from "../utils/database";
import { UserGoals } from "../utils/database.types";
import { MacroResult } from "../utils/demoVision";

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

const DEFAULT_GOALS: UserGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  hydration_goal_ml: 3000,
  fiber_goal: 35,
  sugar_limit: 25,
  streak: 0,
};

export function useDiary(initialDate?: string) {
  const [date, setDate] = useState(initialDate ?? todayISO());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [hydrationMl, setHydrationMl] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [e, t, g, h] = await Promise.all([
        getDiaryEntriesByDate(date),
        getDailyTotals(date),
        getUserGoals(),
        getHydration(date),
      ]);
      setEntries(e);
      setTotals(t);
      setGoals(g);
      setHydrationMl(h);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(
    async (
      result: MacroResult,
      mealType: DiaryEntry["meal_type"],
      imageUri?: string
    ) => {
      await addDiaryEntry(
        {
          date,
          meal_type: mealType,
          food_name: result.foodName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          fiber: result.fiber,
          serving_size: result.servingSize,
        },
        imageUri
      );
      await refresh();
    },
    [date, refresh]
  );

  const removeEntry = useCallback(
    async (id: number) => {
      await deleteDiaryEntry(id);
      await refresh();
    },
    [refresh]
  );

  const logWater = useCallback(
    async (ml: number) => {
      await addHydration(date, ml);
      const h = await getHydration(date);
      setHydrationMl(h);
    },
    [date]
  );

  const shiftDate = useCallback((days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  }, [date]);

  return {
    date,
    setDate,
    shiftDate,
    entries,
    totals,
    goals,
    streak: goals.streak,
    hydrationMl,
    loading,
    refresh,
    addEntry,
    deleteEntry: removeEntry,
    logWater,
  };
}
