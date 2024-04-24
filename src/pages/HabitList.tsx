import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Habit } from '../components/Habit'

export function HabitList() {
    const [habits, setHabits] = useState<Habit[]>([])

    useEffect(() => {
        updateHabits()
    }, [])

    async function updateHabits() {
        const { data } = await supabase.from('habits').select('*')
        setHabits(data as any)
    }

    return (
        <div className="h-full grid flex-col">
            {habits.map(habit => <Habit habit={habit} key={habit.id} />)}
            <button
                className="flex w-full mt-3 self-end justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                + Add habit
            </button>
        </div>
    );
}