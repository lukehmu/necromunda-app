import { type FormEvent, useState } from 'react'
import { useStore } from '@/store'

export function AddFighterForm() {
  const { dispatch } = useStore()
  const [name, setName] = useState('')
  const [wounds, setWounds] = useState('1')

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'add', name, maxWounds: Number(wounds) || 1 })
    setName('')
    setWounds('1')
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-2 rounded-xl border border-hive-700 bg-hive-900 p-2"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add fighter"
        aria-label="Fighter name"
        className="min-w-0 flex-1 rounded-lg bg-hive-800 px-3 py-2 text-hive-200 placeholder:text-hive-400 outline-none focus:ring-1 focus:ring-plasma"
      />
      <input
        type="number"
        min={1}
        max={20}
        value={wounds}
        onChange={(e) => setWounds(e.target.value)}
        aria-label="Total wounds"
        className="w-16 rounded-lg bg-hive-800 px-2 py-2 text-center text-hive-200 tabular-nums outline-none focus:ring-1 focus:ring-plasma"
      />
      <button
        type="submit"
        className="rounded-lg bg-rust px-4 py-2 font-semibold text-white active:brightness-90"
      >
        Add
      </button>
    </form>
  )
}
