import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { ResponsiveCalendar } from "@nivo/calendar";
import { format, startOfYear, subDays } from "date-fns";

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
  console.log(habitEntries);
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl">{props.habit.name}</h2>
      {habitEntries && <HabitEntryCalendar entries={habitEntries} />}
      <DoneButton isDone={false} onClick={() => console.log("Done")} />
    </div>
  );
};

const DoneButton = (props: { isDone: boolean; onClick: () => void }) => {
  return (
    <button
      onClick={props.onClick}
      className="bg-indigo-600 w-fit py-1.5 px-3 rounded-md text-white font-semibold leading-6 text-sm"
    >
      Did it!
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
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  useEffect(() => {
    supabase
      .from("habits_entries")
      .select("*")
      .eq("habit_id", habitId)
      .then(({ data }) => setEntries(data as HabitEntry[]));
  }, [habitId]);
  return entries;
};
