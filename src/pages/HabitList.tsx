import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Habit } from "../components/Habit";

export function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    updateHabits();
  }, []);

  async function updateHabits() {
    const { data } = await supabase.from("habits").select("*");
    setHabits(data as any);
  }

  return (
    <div className="h-full grid flex-col">
      {habits.map((habit) => (
        <Habit habit={habit} key={habit.id} />
      ))}
    </div>
  );
}
