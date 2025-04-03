import {
  appendSheet,
  findRowByValue,
  readSheet,
  updateRow,
  generateId,
  rowToArray,
  arrayToRow,
} from "./spreadsheet";

const SHEET_NAME = "mood_ratings";
const HEADERS = ["id", "date", "rating"];

export interface MoodRating {
  id: string;
  date: string;
  rating: number;
}

/**
 * Transforms an array from the spreadsheet into a MoodRating object
 */
export const toMoodRating = (row: any[]): MoodRating => {
  const entry = arrayToRow(HEADERS, row);
  return {
    id: entry.id,
    date: entry.date,
    rating: Number(entry.rating),
  };
};

/**
 * Transforms a MoodRating object into an array for the spreadsheet
 */
export const fromMoodRating = (entry: MoodRating): any[] => {
  return rowToArray(HEADERS, entry);
};

/**
 * Gets all mood ratings
 */
export const getAllMoodRatings = async (): Promise<MoodRating[]> => {
  try {
    const rows = await readSheet(SHEET_NAME);
    if (rows.length <= 1) {
      return [];
    }

    // Skip header row (index 0)
    return rows.slice(1).map(toMoodRating);
  } catch (error) {
    console.error("Error fetching mood ratings:", error);
    throw error;
  }
};

/**
 * Gets a mood rating by date
 */
export const getMoodRatingByDate = async (
  date: string,
): Promise<MoodRating | null> => {
  try {
    const rows = await readSheet(SHEET_NAME);
    if (rows.length <= 1) {
      return null;
    }

    const headers = rows[0];
    const [entry] = findRowByValue(rows, headers, "date", date);

    return entry ? toMoodRating(Object.values(entry)) : null;
  } catch (error) {
    console.error(`Error fetching mood rating for date ${date}:`, error);
    throw error;
  }
};

/**
 * Creates a new mood rating
 */
export const createMoodRating = async (
  data: Omit<MoodRating, "id">,
): Promise<MoodRating> => {
  try {
    const entry: MoodRating = {
      ...data,
      id: generateId(),
    };

    await appendSheet(SHEET_NAME, [fromMoodRating(entry)]);
    return entry;
  } catch (error) {
    console.error("Error creating mood rating:", error);
    throw error;
  }
};

/**
 * Updates an existing mood rating
 */
export const updateMoodRating = async (
  id: string,
  data: Partial<MoodRating>,
): Promise<MoodRating> => {
  try {
    const rows = await readSheet(SHEET_NAME);
    const headers = rows[0];
    const [existingEntry, rowIndex] = findRowByValue(rows, headers, "id", id);

    if (!existingEntry || rowIndex === -1) {
      throw new Error(`Mood rating with ID ${id} not found`);
    }

    const updatedEntry = {
      ...toMoodRating(Object.values(existingEntry)),
      ...data,
    };

    await updateRow(SHEET_NAME, rowIndex, HEADERS, updatedEntry);
    return updatedEntry;
  } catch (error) {
    console.error(`Error updating mood rating ${id}:`, error);
    throw error;
  }
};

/**
 * Upserts a mood rating (create or update based on date)
 */
export const upsertMoodRating = async (
  data: Omit<MoodRating, "id"> & { id?: string },
): Promise<MoodRating> => {
  try {
    const rows = await readSheet(SHEET_NAME);
    if (rows.length <= 1) {
      // No entries yet, create new
      return await createMoodRating(data);
    }

    const headers = rows[0];
    const [existingEntry, rowIndex] = findRowByValue(
      rows,
      headers,
      "date",
      data.date,
    );

    if (!existingEntry || rowIndex === -1) {
      // No matching entry, create new
      return await createMoodRating(data);
    }

    // Update existing entry
    const existingId = existingEntry.id;
    const updatedEntry = {
      ...toMoodRating(Object.values(existingEntry)),
      ...data,
      id: existingId, // Ensure ID doesn't change
    };

    await updateRow(SHEET_NAME, rowIndex, HEADERS, updatedEntry);
    return updatedEntry;
  } catch (error) {
    console.error(`Error upserting mood rating for date ${data.date}:`, error);
    throw error;
  }
}; 