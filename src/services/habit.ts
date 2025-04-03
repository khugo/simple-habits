import {
  readSheet,
  appendSheet,
  findRowByValue,
  updateRow,
  rowToArray,
  arrayToRow,
  generateId,
  SheetRow,
} from "./spreadsheet";

// Constants
const SHEET_NAME = "habits";
const HEADERS = ["id", "name", "created_at", "archived_at"];

// Types
export interface Habit {
  id: string;
  name: string;
  created_at: Date;
  archived_at?: Date | null;
}

// Convert Sheet row to Habit
const toHabit = (row: SheetRow): Habit => {
  return {
    id: row.id,
    name: row.name,
    created_at: row.created_at ? new Date(row.created_at) : new Date(),
    archived_at: row.archived_at ? new Date(row.archived_at) : null,
  };
};

// Convert Habit to Sheet row
const fromHabit = (habit: Habit): SheetRow => {
  return {
    id: habit.id,
    name: habit.name,
    created_at: habit.created_at.toISOString(),
    archived_at: habit.archived_at ? habit.archived_at.toISOString() : "",
  };
};

// Get all habits
export const getHabits = async (): Promise<Habit[]> => {
  try {
    const rows = await readSheet(SHEET_NAME);

    // If no data or just headers, return empty array
    if (!rows.length || rows.length === 1) {
      return [];
    }

    // First row is headers, so start from index 1
    return rows.slice(1).map((row) => {
      const rowData = arrayToRow(HEADERS, row);
      return toHabit(rowData);
    });
  } catch (error) {
    console.error("Error getting habits:", error);
    throw error;
  }
};

// Get a single habit by ID
export const getHabitById = async (id: string): Promise<Habit | null> => {
  try {
    const rows = await readSheet(SHEET_NAME);

    if (!rows.length) {
      return null;
    }

    const [habit, _] = findRowByValue(rows, HEADERS, "id", id);

    return habit ? toHabit(habit) : null;
  } catch (error) {
    console.error(`Error getting habit with ID ${id}:`, error);
    throw error;
  }
};

// Add a new habit
export const addHabit = async (name: string): Promise<Habit> => {
  try {
    const newHabit: Habit = {
      id: generateId(),
      name,
      created_at: new Date(),
      archived_at: null,
    };

    const rowData = fromHabit(newHabit);
    const values = [rowToArray(HEADERS, rowData)];

    await appendSheet(SHEET_NAME, values);

    return newHabit;
  } catch (error) {
    console.error(`Error adding habit "${name}":`, error);
    throw error;
  }
};

// Update a habit
export const updateHabit = async (
  id: string,
  data: Partial<Habit>,
): Promise<Habit | null> => {
  try {
    const rows = await readSheet(SHEET_NAME);

    if (!rows.length) {
      throw new Error("No habits found");
    }

    const [habit, rowIndex] = findRowByValue(rows, HEADERS, "id", id);

    if (!habit || rowIndex === -1) {
      return null;
    }

    const updatedHabit = {
      ...toHabit(habit),
      ...data,
    };

    const rowData = fromHabit(updatedHabit);
    await updateRow(SHEET_NAME, rowIndex, HEADERS, rowData);

    return updatedHabit;
  } catch (error) {
    console.error(`Error updating habit with ID ${id}:`, error);
    throw error;
  }
};

// Archive a habit
export const archiveHabit = async (id: string): Promise<Habit | null> => {
  try {
    return await updateHabit(id, { archived_at: new Date() });
  } catch (error) {
    console.error(`Error archiving habit with ID ${id}:`, error);
    throw error;
  }
};

// Unarchive a habit
export const unarchiveHabit = async (id: string): Promise<Habit | null> => {
  try {
    return await updateHabit(id, { archived_at: null });
  } catch (error) {
    console.error(`Error unarchiving habit with ID ${id}:`, error);
    throw error;
  }
};
