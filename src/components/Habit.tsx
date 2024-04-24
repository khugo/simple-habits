import React, { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"

export type Habit = {
    id: string
    name: string
}

export type HabitEntry = {
    id: string
    habitId: string
    timestamp: string
}

export const Habit = (props: { habit: Habit }) => {
    const habitEntries = useHabitEntries(props.habit.id)
    return (
        <div className="flex flex-col">
            <h2 className="text-2xl">{props.habit.name}</h2>
            <p>{habitEntries.length} entries</p>
            <DoneButton isDone={false} onClick={() => console.log("Done")} />
        </div>
    )
}

const DoneButton = (props: { isDone: boolean; onClick: () => void }) => {
    return (
        <button onClick={props.onClick} className="bg-indigo-600 w-fit py-1.5 px-3 rounded-md text-white font-semibold leading-6 text-sm">Did it!</button>
    )
}

const useHabitEntries = (habitId: string) => {
    const [entries, setEntries] = useState<HabitEntry[]>([])
    useEffect(() => {
        supabase.from('habits_entries').select('*').eq('habit_id', habitId).then(({ data }) => setEntries(data as HabitEntry[]))
    }, [habitId])
    return entries
}