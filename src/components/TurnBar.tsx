import { useStore } from '@/store'

export function TurnBar() {
  const { state, dispatch } = useStore()
  // Fighters who are out of action have nothing left to activate.
  const inPlay = state.fighters.filter((f) => f.condition !== 'out')
  const pending = inPlay.filter((f) => !f.activated).length

  return (
    <header className="sticky top-0 z-10 border-b border-hive-700 bg-hive-950/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex items-center gap-3 py-3">
        <div className="min-w-0">
          <p className="text-xs tracking-widest text-hive-400 uppercase">Round</p>
          <p className="text-3xl leading-none font-bold tabular-nums">{state.turn}</p>
        </div>
        <p className="min-w-0 flex-1 text-sm text-hive-400">
          {inPlay.length === 0
            ? 'No fighters in play'
            : pending === 0
              ? 'All fighters activated'
              : `${pending} still to activate`}
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'newTurn' })}
          className="min-h-12 rounded-lg bg-plasma px-4 font-semibold text-hive-950 active:brightness-90"
        >
          New turn
        </button>
      </div>
    </header>
  )
}
