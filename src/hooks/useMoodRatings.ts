import { useState, useEffect, useCallback } from "react";
import {
  MoodRating,
  getAllMoodRatings,
  upsertMoodRating,
} from "../services/moodRating";

interface UseMoodRatingsReturn {
  moodRatings: MoodRating[];
  moodRatingsByDate: Map<string, MoodRating>;
  isLoading: boolean;
  error: Error | null;
  refreshMoodRatings: () => Promise<void>;
  updateMoodRating: (date: string | Date, rating: number) => Promise<void>;
}

export const useMoodRatings = (): UseMoodRatingsReturn => {
  const [moodRatings, setMoodRatings] = useState<MoodRating[]>([]);
  const [moodRatingsByDate, setMoodRatingsByDate] = useState<
    Map<string, MoodRating>
  >(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshMoodRatings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const ratings = await getAllMoodRatings();
      setMoodRatings(ratings);

      // Create a map for quick lookup by date
      const ratingsByDate = new Map<string, MoodRating>();
      ratings.forEach((rating) => {
        ratingsByDate.set(rating.date, rating);
      });

      setMoodRatingsByDate(ratingsByDate);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Failed to fetch mood ratings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMoodRating = useCallback(async (date: string | Date, rating: number) => {
    try {
      setError(null);

      // Format date as YYYY-MM-DD
      const formattedDate = typeof date === 'object'
        ? date.toISOString().split("T")[0]
        : date;

      await upsertMoodRating({
        date: formattedDate,
        rating,
      });

      // Refresh the mood ratings
      await refreshMoodRatings();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Failed to update mood rating:", err);
      throw err;
    }
  }, [refreshMoodRatings]);

  // Load mood ratings on mount
  useEffect(() => {
    refreshMoodRatings();
  }, [refreshMoodRatings]);

  return {
    moodRatings,
    moodRatingsByDate,
    isLoading,
    error,
    refreshMoodRatings,
    updateMoodRating,
  };
}; 