import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  eachDayOfInterval,
  endOfDay,
  endOfYear,
  isSameDay,
  startOfDay,
  startOfYear,
} from "date-fns";
import { useGlobalState } from "../contexts/GlobalState.tsx";
import { HabitCalendar } from "./HabitCalendar.tsx";
import { Simulate } from "react-dom/test-utils";
import select = Simulate.select;

export type Habit = {
  id: string;
  name: string;
  archivedAt?: Date;
  createdAt: Date;
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
  const {
    state: { selectedDate },
  } = useGlobalState();

  useEffect(() => {
    if (!habitEntries) return;
    setIsDone(
      habitEntries.some((entry) =>
        isSameDay(selectedDate, new Date(entry.timestamp)),
      ),
    );
  }, [isDone, habitEntries, selectedDate]);

  const addHabitEntry = async () => {
    const timestamp = selectedDate;
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

  const removeHabitEntry = async () => {
    const timeframeStart = startOfDay(selectedDate);
    const timeframeEnd = endOfDay(selectedDate);
    try {
      setSubmitLoading(true);
      await supabase
        .from("habits_entries")
        .delete()
        .eq("habit_id", props.habit.id)
        .gte("timestamp", timeframeStart.toISOString())
        .lte("timestamp", timeframeEnd.toISOString());
      await reload();
      setIsDone(false);
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
          <HabitEntryCalendar
            entries={habitEntries}
            selectedDate={selectedDate}
          />
          <div className={"pt-2"}>
            <DoneButton
              onDone={addHabitEntry}
              onNotDone={removeHabitEntry}
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
  onDone: () => void;
  onNotDone: () => void;
}) => {
  if (props.isDone) {
    return <p onClick={props.onNotDone}>Done ×</p>;
  }
  return (
    <button
      onClick={!props.isDone && !props.isLoading ? props.onDone : undefined}
      className="bg-indigo-500 w-fit py-1.5 px-4 rounded-md text-white font-semibold leading-6 text-m z-10"
    >
      {props.isLoading ? "⌛" : "Did it!"}
    </button>
  );
};

const allDatesOfThisYear = getAllDatesOfThisYear();

const HabitEntryCalendar = (props: {
  entries: HabitEntry[];
  selectedDate: Date;
}) => {
  const entriesByDate = useMemo(() => {
    return new Map(
      props.entries.map((entry) => [
        startOfDay(new Date(entry.timestamp)).getTime(),
        entry,
      ]),
    );
  }, [props.entries]);
  const data = useMemo(
    () =>
      allDatesOfThisYear.map((date) => ({
        date,
        value: entriesByDate.get(date.getTime()) ? 1 : 0,
      })),
    [entriesByDate],
  );
  const svg = HabitCalendar(data, {
    x: (d) => d.date,
    y: (d) => d.value,
    weekday: "monday",
    highlightDate: props.selectedDate,
  });
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: svg.outerHTML,
      }}
    />
  );
};

function getAllDatesOfThisYear() {
  const start = startOfYear(new Date());
  const end = endOfYear(new Date());
  return eachDayOfInterval({ start, end });
}

const useHabitEntries = (habitId: string) => {
  const [entries, setEntries] = useState<HabitEntry[] | undefined>(undefined);

  const updateHabits = useCallback(async () => {
    await supabase
      .from("habits_entries")
      .select("*")
      .eq("habit_id", habitId)
      .then(({ data }) => setEntries(data as HabitEntry[]));
  }, [habitId]);

  useEffect(() => {
    void updateHabits();
  }, [habitId, updateHabits]);

  return { data: entries, reload: updateHabits };
};
