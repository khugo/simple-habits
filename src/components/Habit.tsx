import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useHabitEntries } from "../hooks/useHabitEntries";
import { Habit as HabitType } from "../services/habit";
import { HabitEntry as HabitEntryType } from "../services/habitEntry";
import select = Simulate.select;

export type Habit = HabitType;
export type HabitEntry = HabitEntryType;

export const Habit = (props: { habit: Habit }) => {
  const {
    entries,
    isLoading: entriesLoading,
    addEntry,
    deleteEntry,
    refresh: reloadEntries,
  } = useHabitEntries(props.habit.id);

  const [isDone, setIsDone] = useState<undefined | boolean>(undefined);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    state: { selectedDate },
  } = useGlobalState();

  useEffect(() => {
    if (entriesLoading) return;

    setIsDone(
      entries.some((entry) => isSameDay(selectedDate, entry.timestamp)),
    );
  }, [entries, entriesLoading, selectedDate]);

  const addHabitEntry = async () => {
    try {
      setSubmitLoading(true);
      await addEntry(selectedDate);
      setIsDone(true);
    } catch (error) {
      console.error("Error adding habit entry:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const removeHabitEntry = async () => {
    try {
      setSubmitLoading(true);

      // Find entries for the selected date
      const entriesForDate = entries.filter((entry) =>
        isSameDay(selectedDate, entry.timestamp),
      );

      if (entriesForDate.length > 0) {
        // Delete all entries for the selected date
        for (const entry of entriesForDate) {
          await deleteEntry(entry.id);
        }

        setIsDone(false);
      }
    } catch (error) {
      console.error("Error removing habit entry:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl">{props.habit.name}</h2>
      {entriesLoading || isDone === undefined ? (
        <p>Loading...</p>
      ) : (
        <>
          <HabitEntryCalendar entries={entries} selectedDate={selectedDate} />
          <div className={"pt-1"}>
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
