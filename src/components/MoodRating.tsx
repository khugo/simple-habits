import { useGlobalState } from "../contexts/GlobalState.tsx";
import { RatingPicker } from "./RatingPicker.tsx";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.ts";

type MoodHabitEntry = {
  id: string;
  date: Date;
  rating: number;
};

export const MoodRating = () => {
  const {
    state: { selectedDate },
  } = useGlobalState();
  const [moodHabitEntriesByDate, setMoodHabitEntriesByDate] = useState<
    Map<string, MoodHabitEntry> | undefined
  >(undefined);
  const {
    state: { userId },
  } = useGlobalState();

  useEffect(() => {
    void refreshMoodHabitEntries();
  }, []);

  async function refreshMoodHabitEntries() {
    const { data } = await supabase.from("mood_rating_entries").select("*");
    setMoodHabitEntriesByDate(
      new Map<string, MoodHabitEntry>(
        (data as any).map((r: any) => [
          new Date(r.date).toISOString().split("T")[0],
          r,
        ]),
      ),
    );
  }

  const updateMoodRating = async (newRating: number) => {
    try {
      await supabase.from("mood_rating_entries").upsert(
        {
          date: selectedDate,
          rating: newRating,
          user_id: userId,
        },
        { onConflict: "user_id, date" },
      );
      await refreshMoodHabitEntries();
    } catch (e) {
      alert(`Error updating mood rating: ${e}`);
    }
  };

  const currentValue = moodHabitEntriesByDate?.get(
    selectedDate.toISOString().split("T")[0],
  )?.rating;

  return (
    <div className={"flex flex-col items-center"}>
      <RatingPicker
        range={{ start: 4, end: 10 }}
        selectedValue={currentValue}
        onSelect={updateMoodRating}
      />
    </div>
  );
};

const useMoodRatings = () => {};
