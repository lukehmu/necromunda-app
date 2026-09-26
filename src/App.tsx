import { CaretDownIcon, GearSixIcon } from '@phosphor-icons/react'
import { AddFighterForm } from '@/components/AddFighterForm'
import { FighterCard } from '@/components/FighterCard'
import { ThemeToggle, useAppliedTheme } from '@/components/ThemeToggle'
import { TurnBar } from '@/components/TurnBar'
import { useStore } from '@/store'

export default function App() {
  const { state, dispatch } = useStore()

  useAppliedTheme(state.theme)

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <TurnBar />

      <main className="flex-1 space-y-4 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <AddFighterForm />

        {state.fighters.length === 0 ? (
          <div className="border border-dashed border-hive-700 px-6 py-10 text-center">
            <p className="font-stencil text-3xl text-hive-400 uppercase">Muster your gang</p>
            <p className="mx-auto mt-2 max-w-[32ch] text-hive-400">
              Add each fighter with the wounds on their card. Then track the fight turn by turn.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {state.fighters.map((fighter) => (
              <FighterCard key={fighter.id} fighter={fighter} />
            ))}
          </ul>
        )}

        <details className="group plate">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-5 font-condensed text-sm font-bold tracking-[0.16em] text-hive-400 uppercase [&::-webkit-details-marker]:hidden">
            <GearSixIcon aria-hidden size={18} weight="bold" />
            Settings
            <CaretDownIcon
              aria-hidden
              size={16}
              weight="bold"
              className="ml-auto transition-transform group-open:rotate-180"
            />
          </summary>

          <div className="space-y-5 border-t border-hive-700 px-5 pt-4 pb-5">
            <ThemeToggle />

            <div className="grid grid-cols-2 gap-2 border-t border-hive-700 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset wounds, flags and the round counter?')) {
                    dispatch({ type: 'resetBattle' })
                  }
                }}
                className="press well min-h-11 px-3 font-condensed text-sm font-bold tracking-wider text-hive-200 uppercase"
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
                className="press min-h-11 rounded-[2px] border border-blood/60 px-3 font-condensed text-sm font-bold tracking-wider text-blood uppercase active:bg-blood/10"
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
