import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { ResponsiveCalendar } from "@nivo/calendar";
import { format, isSameDay, startOfYear } from "date-fns";
import { getActiveDate } from "../utils/date";

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
  const habitEntries = useHabitEntries(props.habit.id);
  const [isDone, setIsDone] = useState<undefined | boolean>(undefined);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isDone !== undefined || !habitEntries) return;
    setIsDone(
      habitEntries.some((entry) =>
        isSameDay(getActiveDate(), new Date(entry.timestamp)),
      ),
    );
  }, [isDone, habitEntries]);

  const addHabitEntry = async () => {
    const timestamp = getActiveDate();
    try {
      setSubmitLoading(true);
      await supabase.from("habits_entries").insert({
        habit_id: props.habit.id,
        timestamp,
      });
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
          <DoneButton
            onClick={addHabitEntry}
            isDone={isDone}
            isLoading={submitLoading}
          />
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
    return <p>Done for today</p>;
  }
  return (
    <button
      onClick={!props.isDone && !props.isLoading ? props.onClick : undefined}
      className="bg-indigo-600 w-fit py-1.5 px-3 rounded-md text-white font-semibold leading-6 text-sm"
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
  console.log(data);
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
  useEffect(() => {
    supabase
      .from("habits_entries")
      .select("*")
      .eq("habit_id", habitId)
      .then(({ data }) => setEntries(data as HabitEntry[]));
  }, [habitId]);
  return entries;
};