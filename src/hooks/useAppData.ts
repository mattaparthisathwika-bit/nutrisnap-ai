import { useState, useEffect, useCallback } from "react";
import {
  getUserGoals,
  getDailyTotals,
  getLastMeal,
  getWeeklyData,
  getLoggedDates,
  getHydration,
} from "../utils/database";
import { UserGoals } from "../utils/database.types";
import { DiaryEntry } from "../utils/database.types";
import { todayISO } from "./useDiary";
import { format, subDays, parseISO } from "date-fns";

export function useAppData() {
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [lastMeal, setLastMeal] = useState<DiaryEntry | null>(null);
  const [hydrationMl, setHydrationMl] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ date: string; total_calories: number }[]>([]);
  const [loggedDates, setLoggedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const today = todayISO();
      const start = format(subDays(parseISO(today), 6), "yyyy-MM-dd");
      const [g, t, meal, h, weekly, dates] = await Promise.all([
        getUserGoals(),
        getDailyTotals(today),
        getLastMeal(today),
        getHydration(today),
        getWeeklyData(start),
        getLoggedDates(start),
      ]);
      setGoals(g);
      setTotals(t);
      setLastMeal(meal);
      setHydrationMl(h);
      setWeeklyData(weekly);
      setLoggedDates(dates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    goals,
    totals,
    lastMeal,
    hydrationMl,
    weeklyData,
    loggedDates,
    loading,
    refresh,
    streak: goals?.streak ?? 0,
  };
}
