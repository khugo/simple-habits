import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Habit } from "../components/Habit";
import _ from "lodash";

export function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    void updateHabits();
  }, []);

  async function updateHabits() {
    const { data } = await supabase.from("habits").select("*");
    setHabits(
      (data as any).map((h: any) => ({
        ...h,
        created_at: new Date(h.created_at),
        archived_at: h.archived_at ? new Date(h.archived_at) : undefined,
      })),
    );
  }

  const sortedHabits = _.orderBy(
    habits,
    ["archived_at", "created_at"],
    ["desc", "desc"],
  );

  return (
    <div className="grid flex-col space-y-4 pb-2">
      {sortedHabits.map((habit) => (
        <Habit habit={habit} key={habit.id} />
      ))}
    </div>
  );
}
