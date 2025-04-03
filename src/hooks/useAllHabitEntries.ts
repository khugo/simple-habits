import { useState, useEffect, useCallback } from "react";
import * as habitEntryService from "../services/habitEntry";
import { HabitEntry } from "../services/habitEntry";

// Interface for the hook's return values
interface UseAllHabitEntriesResult {
  entriesByHabitId: Map<string, HabitEntry[]>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Create a singleton state that will be shared across all instances of the hook
// We keep entriesByHabitId as the main data structure used by components
let entriesByHabitId: Map<string, HabitEntry[]> = new Map();
let isLoading = false;
let error: string | null = null;
let refreshPromise: Promise<void> | null = null;
let initialized = false;

// Helper function to organize entries by habit ID
const organizeEntriesByHabitId = (
  entries: HabitEntry[],
): Map<string, HabitEntry[]> => {
  const map = new Map<string, HabitEntry[]>();

  for (const entry of entries) {
    if (!map.has(entry.habit_id)) {
      map.set(entry.habit_id, []);
    }
    map.get(entry.habit_id)?.push(entry);
  }

  return map;
};

export function useAllHabitEntries(): UseAllHabitEntriesResult {
  const [hookState, setHookState] = useState({
    entriesByHabitId,
    isLoading,
    error,
  });

  const refresh = useCallback(async (): Promise<void> => {
    // If already refreshing, return the existing promise
    if (refreshPromise) {
      return refreshPromise;
    }

    isLoading = true;
    error = null;

    // Update all hook instances
    setHookState({
      entriesByHabitId,
      isLoading: true,
      error: null,
    });

    refreshPromise = new Promise<void>((resolve, reject) => {
      habitEntryService
        .getAllHabitEntries()
        .then((fetchedEntries) => {
          entriesByHabitId = organizeEntriesByHabitId(fetchedEntries);
          isLoading = false;
          error = null;
          refreshPromise = null;
          initialized = true;

          // Update all hook instances
          setHookState({
            entriesByHabitId,
            isLoading: false,
            error: null,
          });
          resolve();
        })
        .catch((err) => {
          console.error("Error fetching all habit entries:", err);
          isLoading = false;
          error = err.message || "Failed to fetch habit entries";
          refreshPromise = null;

          // Update all hook instances
          setHookState({
            entriesByHabitId,
            isLoading: false,
            error,
          });

          reject(err);
        });
    });

    return refreshPromise;
  }, []);

  // Initial data loading
  useEffect(() => {
    if (!initialized && !isLoading && !refreshPromise) {
      refresh();
    }
  }, [refresh]);

  return {
    entriesByHabitId: hookState.entriesByHabitId,
    isLoading: hookState.isLoading,
    error: hookState.error,
    refresh,
  };
} 