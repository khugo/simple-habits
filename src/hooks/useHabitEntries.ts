import { useState, useEffect, useCallback } from "react";
import * as habitEntryService from "../services/habitEntry";
import { HabitEntry } from "../services/habitEntry";
import { useAllHabitEntries } from "./useAllHabitEntries";

interface UseHabitEntriesResult {
  entries: HabitEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addEntry: (timestamp?: Date) => Promise<HabitEntry>;
  deleteEntry: (entryId: string) => Promise<boolean>;
  getEntryCount: () => Promise<number>;
  getEntriesForDateRange: (
    startDate: Date,
    endDate: Date,
  ) => Promise<HabitEntry[]>;
}

export function useHabitEntries(habitId: string): UseHabitEntriesResult {
  // Use the centralized hook to access all entries
  const {
    entriesByHabitId,
    isLoading: allEntriesLoading,
    error: allEntriesError,
    refresh: refreshAllEntries,
  } = useAllHabitEntries();

  // Get entries for this specific habit
  const [entries, setEntries] = useState<HabitEntry[]>(
    entriesByHabitId.get(habitId) || [],
  );

  // Update entries when entriesByHabitId changes
  useEffect(() => {
    setEntries(entriesByHabitId.get(habitId) || []);
  }, [entriesByHabitId, habitId]);

  const refresh = useCallback(async () => {
    // Use the centralized refresh
    await refreshAllEntries();
  }, [refreshAllEntries]);

  const addEntry = useCallback(
    async (timestamp?: Date): Promise<HabitEntry> => {
      try {
        const newEntry = await habitEntryService.addHabitEntry(
          habitId,
          timestamp,
        );

        // Update the local entries state
        setEntries((currentEntries) => [...currentEntries, newEntry]);

        // Refresh all entries to update the global state
        refreshAllEntries();

        return newEntry;
      } catch (err: any) {
        console.error(`Error adding entry for habit ${habitId}:`, err);
        throw err;
      }
    },
    [habitId, refreshAllEntries],
  );

  const deleteEntry = useCallback(
    async (entryId: string): Promise<boolean> => {
      try {
        const success = await habitEntryService.deleteHabitEntry(entryId);
        if (success) {
          // Update the local entries state
          setEntries((currentEntries) =>
            currentEntries.filter((entry) => entry.id !== entryId),
          );

          // Refresh all entries to update the global state
          refreshAllEntries();
        }
        return success;
      } catch (err: any) {
        console.error(`Error deleting entry ${entryId}:`, err);
        throw err;
      }
    },
    [refreshAllEntries],
  );

  const getEntryCount = useCallback((): Promise<number> => {
    // Return a resolved promise with the entries length
    return Promise.resolve(entries.length);
  }, [entries]);

  const getEntriesForDateRange = useCallback(
    (startDate: Date, endDate: Date): Promise<HabitEntry[]> => {
      // Filter the local entries array and return as a resolved promise
      const filteredEntries = entries.filter(
        (entry) => entry.timestamp >= startDate && entry.timestamp <= endDate,
      );
      return Promise.resolve(filteredEntries);
    },
    [entries],
  );

  return {
    entries,
    isLoading: allEntriesLoading,
    error: allEntriesError,
    refresh,
    addEntry,
    deleteEntry,
    getEntryCount,
    getEntriesForDateRange,
  };
}
