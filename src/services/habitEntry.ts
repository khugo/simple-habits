import {
  readSheet,
  appendSheet,
  findRowByValue,
  deleteRow,
  rowToArray,
  arrayToRow,
  generateId,
  SheetRow,
} from "./spreadsheet";

// Constants
const SHEET_NAME = "habits_entries";
const HEADERS = ["id", "habit_id", "timestamp"];

// Types
export interface HabitEntry {
  id: string;
  habit_id: string;
  timestamp: Date;
}

// Convert Sheet row to HabitEntry
const toHabitEntry = (row: SheetRow): HabitEntry => {
  return {
    id: row.id,
    habit_id: row.habit_id,
    timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
  };
};

// Convert HabitEntry to Sheet row
const fromHabitEntry = (entry: HabitEntry): SheetRow => {
  return {
    id: entry.id,
    habit_id: entry.habit_id,
    timestamp: entry.timestamp.toISOString(),
  };
};

// Get all habit entries (regardless of habit ID)
export const getAllHabitEntries = async (): Promise<HabitEntry[]> => {
  try {
    const rows = await readSheet(SHEET_NAME);

    // If no data or just headers, return empty array
    if (!rows.length || rows.length === 1) {
      return [];
    }

    // First row is headers, so start from index 1
    return rows.slice(1).map((row) => {
      const rowData = arrayToRow(HEADERS, row);
      return toHabitEntry(rowData);
    });
  } catch (error) {
    console.error("Error getting all habit entries:", error);
    throw error;
  }
};

// Get all entries for a habit
export const getHabitEntries = async (
  habitId: string,
): Promise<HabitEntry[]> => {
  try {
    const allEntries = await getAllHabitEntries();

    // Filter entries for the specific habit
    return allEntries.filter((entry) => entry.habit_id === habitId);
  } catch (error) {
    console.error(`Error getting entries for habit ${habitId}:`, error);
    throw error;
  }
};

// Get entries for a habit within a date range
export const getHabitEntriesForDateRange = async (
  habitId: string,
  startDate: Date,
  endDate: Date,
): Promise<HabitEntry[]> => {
  try {
    const entries = await getHabitEntries(habitId);

    return entries.filter((entry) => {
      return entry.timestamp >= startDate && entry.timestamp <= endDate;
    });
  } catch (error) {
    console.error(
      `Error getting entries for habit ${habitId} in date range:`,
      error,
    );
    throw error;
  }
};

// Add a new habit entry
export const addHabitEntry = async (
  habitId: string,
  timestamp?: Date,
): Promise<HabitEntry> => {
  try {
    const newEntry: HabitEntry = {
      id: generateId(),
      habit_id: habitId,
      timestamp: timestamp || new Date(),
    };

    const rowData = fromHabitEntry(newEntry);
    const values = [rowToArray(HEADERS, rowData)];

    await appendSheet(SHEET_NAME, values);

    return newEntry;
  } catch (error) {
    console.error(`Error adding entry for habit ${habitId}:`, error);
    throw error;
  }
};

// Delete a habit entry
export const deleteHabitEntry = async (entryId: string): Promise<boolean> => {
  try {
    const rows = await readSheet(SHEET_NAME);

    if (!rows.length) {
      return false;
    }

    const [_, rowIndex] = findRowByValue(rows, HEADERS, "id", entryId);

    if (rowIndex === -1) {
      return false;
    }

    await deleteRow(SHEET_NAME, rowIndex, HEADERS.length);
    return true;
  } catch (error) {
    console.error(`Error deleting entry ${entryId}:`, error);
    throw error;
  }
};

// Get count of entries for a habit
export const getHabitEntryCount = async (habitId: string): Promise<number> => {
  try {
    const entries = await getHabitEntries(habitId);
    return entries.length;
  } catch (error) {
    console.error(`Error getting entry count for habit ${habitId}:`, error);
    throw error;
  }
};
