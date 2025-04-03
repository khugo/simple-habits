import { useGlobalState } from "../contexts/GlobalState.tsx";
import { RatingPicker } from "./RatingPicker.tsx";
import { useMoodRatings } from "../hooks/useMoodRatings";

export const MoodRating = () => {
  const {
    state: { selectedDate },
  } = useGlobalState();

  const { moodRatingsByDate, updateMoodRating, error } = useMoodRatings();

  const handleRatingSelect = async (newRating: number) => {
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      await updateMoodRating(dateStr, newRating);
    } catch (e) {
      // Error is already handled by the hook
      console.error("Error updating mood rating:", e);
    }
  };

  const currentDate = selectedDate.toISOString().split("T")[0];
  const currentValue = moodRatingsByDate?.get(currentDate)?.rating;

  if (error) {
    return (
      <div className="text-red-500">
        Error loading mood ratings: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <RatingPicker
        range={{ start: 4, end: 10 }}
        selectedValue={currentValue}
        onSelect={handleRatingSelect}
      />
    </div>
  );
};
