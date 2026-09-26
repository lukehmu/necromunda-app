import { AddFighterForm } from '@/components/AddFighterForm'
import { FighterCard } from '@/components/FighterCard'
import { RulesToggle } from '@/components/RulesToggle'
import { ThemeToggle, useAppliedTheme } from '@/components/ThemeToggle'
import { TurnBar } from '@/components/TurnBar'
import { useStore } from '@/store'

export default function App() {
  const { state, dispatch } = useStore()

  useAppliedTheme(state.theme)

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <TurnBar />

      <main className="flex-1 space-y-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <AddFighterForm />

        {state.fighters.length === 0 ? (
          <p className="py-12 text-center text-hive-400">
            Add your gang, then track wounds and activations as the game runs.
          </p>
        ) : (
          <ul className="space-y-3">
            {state.fighters.map((fighter) => (
              <FighterCard key={fighter.id} fighter={fighter} />
            ))}
          </ul>
        )}

        <details className="rounded-xl border border-hive-700 bg-hive-900/60">
          <summary className="cursor-pointer list-none px-3 py-3 text-xs tracking-widest text-hive-400 uppercase">
            Settings
          </summary>

          <div className="space-y-3 border-t border-hive-700 p-3">
            <RulesToggle />
            <ThemeToggle />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset wounds, flags and the round counter?')) {
                    dispatch({ type: 'resetBattle' })
                  }
                }}
                className="min-h-11 flex-1 rounded-lg border border-hive-600 bg-hive-800 px-3 text-sm font-semibold text-hive-200 active:bg-hive-700"
              >
                New battle
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete every fighter? This cannot be undone.')) {
                    dispatch({ type: 'clearAll' })
                  }
                }}
                className="min-h-11 flex-1 rounded-lg border border-hive-700 px-3 text-sm font-semibold text-hive-400 active:bg-hive-800"
              >
                Clear roster
              </button>
            </div>
          </div>
        </details>
      </main>
    </div>
  )
}
