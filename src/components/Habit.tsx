import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { ResponsiveCalendar } from "@nivo/calendar";
import { format, isSameDay, startOfYear } from "date-fns";
import { useActiveDate } from "../utils/date";

export type Habit = {
  id: string;
  name: string;
};

export type HabitEntry = {
  id: string;
  habitId: string;
  timestamp: string;
};

export const Habit = (props: { habit: Habit }) => {
  const { data: habitEntries, reload } = useHabitEntries(props.habit.id);
  const [isDone, setIsDone] = useState<undefined | boolean>(undefined);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { activeDate } = useActiveDate();

  useEffect(() => {
    if (!habitEntries) return;
    setIsDone(
      habitEntries.some((entry) =>
        isSameDay(activeDate, new Date(entry.timestamp)),
      ),
    );
  }, [isDone, habitEntries, activeDate]);

  const addHabitEntry = async () => {
    const timestamp = activeDate;
    try {
      setSubmitLoading(true);
      await supabase.from("habits_entries").insert({
        habit_id: props.habit.id,
        timestamp,
      });
      await reload();
      setIsDone(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl">{props.habit.name}</h2>
      {habitEntries === undefined || isDone === undefined ? (
        <p>Loading...</p>
      ) : (
        <>
          <HabitEntryCalendar entries={habitEntries} />
          <div>
            <DoneButton
              onClick={addHabitEntry}
              isDone={isDone}
              isLoading={submitLoading}
            />
          </div>
        </>
      )}
    </div>
  );
};

const DoneButton = (props: {
  isDone: boolean;
  isLoading: boolean;
  onClick: () => void;
}) => {
  if (props.isDone) {
    return <p>Done</p>;
  }
  return (
    <button
      onClick={!props.isDone && !props.isLoading ? props.onClick : undefined}
      className="bg-indigo-600 w-fit py-1.5 px-4 rounded-md text-white font-semibold leading-6 text-m z-10"
    >
      {props.isLoading ? "⌛" : "Did it!"}
    </button>
  );
};

const HabitEntryCalendar = (props: { entries: HabitEntry[] }) => {
  const today = new Date();
  const from = startOfYear(today);
  const data = useMemo(
    () =>
      props.entries.map((entry) => ({
        day: format(new Date(entry.timestamp), "yyyy-MM-dd"),
        value: 1,
      })),
    [props.entries],
  );
  return (
    <div style={{ height: 115 }}>
      <ResponsiveCalendar
        data={data}
        from={from}
        to={today}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        height={115}
        colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
        yearSpacing={40}
        emptyColor="#eeeeee"
        isInteractive={false}
      />
    </div>
  );
};

const useHabitEntries = (habitId: string) => {
  const [entries, setEntries] = useState<HabitEntry[] | undefined>(undefined);

  const updateHabits = useCallback(() => {
    return supabase
      .from("habits_entries")
      .select("*")
      .eq("habit_id", habitId)
      .then(({ data }) => setEntries(data as HabitEntry[]));
  }, [habitId]);

  useEffect(() => {
    updateHabits();
  }, [habitId, updateHabits]);

  return { data: entries, reload: updateHabits };
};
