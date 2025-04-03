import { useState, useEffect, useCallback } from "react";
import * as habitService from "../services/habit";
import { Habit } from "../services/habit";

interface UseHabitsResult {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addHabit: (name: string) => Promise<Habit>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<Habit | null>;
  archiveHabit: (id: string) => Promise<Habit | null>;
  unarchiveHabit: (id: string) => Promise<Habit | null>;
}

export function useHabits(): UseHabitsResult {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedHabits = await habitService.getHabits();
      setHabits(fetchedHabits);
    } catch (err: any) {
      setError(err.message || "Failed to load habits");
      console.error("Error fetching habits:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addHabit = useCallback(async (name: string): Promise<Habit> => {
    try {
      const newHabit = await habitService.addHabit(name);
      setHabits((currentHabits) => [...currentHabits, newHabit]);
      return newHabit;
    } catch (err: any) {
      setError(err.message || "Failed to add habit");
      console.error("Error adding habit:", err);
      throw err;
    }
  }, []);

  const updateHabit = useCallback(
    async (id: string, data: Partial<Habit>): Promise<Habit | null> => {
      try {
        const updatedHabit = await habitService.updateHabit(id, data);
        if (updatedHabit) {
          setHabits((currentHabits) =>
            currentHabits.map((habit) =>
              habit.id === id ? updatedHabit : habit,
            ),
          );
        }
        return updatedHabit;
      } catch (err: any) {
        setError(err.message || "Failed to update habit");
        console.error("Error updating habit:", err);
        throw err;
      }
    },
    [],
  );

  const archiveHabit = useCallback(
    async (id: string): Promise<Habit | null> => {
      try {
        const archivedHabit = await habitService.archiveHabit(id);
        if (archivedHabit) {
          setHabits((currentHabits) =>
            currentHabits.map((habit) =>
              habit.id === id ? archivedHabit : habit,
            ),
          );
        }
        return archivedHabit;
      } catch (err: any) {
        setError(err.message || "Failed to archive habit");
        console.error("Error archiving habit:", err);
        throw err;
      }
    },
    [],
  );

  const unarchiveHabit = useCallback(
    async (id: string): Promise<Habit | null> => {
      try {
        const unarchivedHabit = await habitService.unarchiveHabit(id);
        if (unarchivedHabit) {
          setHabits((currentHabits) =>
            currentHabits.map((habit) =>
              habit.id === id ? unarchivedHabit : habit,
            ),
          );
        }
        return unarchivedHabit;
      } catch (err: any) {
        setError(err.message || "Failed to unarchive habit");
        console.error("Error unarchiving habit:", err);
        throw err;
      }
    },
    [],
  );

  return {
    habits,
    isLoading,
    error,
    refresh,
    addHabit,
    updateHabit,
    archiveHabit,
    unarchiveHabit,
  };
}
