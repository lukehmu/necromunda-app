import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import { LiveLamp } from '@/components/LivePanel'
import { t } from '@/i18n/en'
import { useLiveGame, useStore } from '@/store'

export const TurnBar = () => {
  const { state, dispatch, readOnly } = useStore()
  const live = useLiveGame()
  const session = live.session
  const inPlay = state.fighters
  const pending = inPlay.filter((f) => !f.activated).length

  const status =
    readOnly && !live.remote
      ? t.live.waiting
      : inPlay.length === 0
        ? t.turnBar.noFighters
        : pending === 0
          ? t.turnBar.allActivated
          : t.turnBar.toActivate(pending, inPlay.length)

  return (
    <header className="sticky top-0 z-10 bg-hive-950/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="shrink-0">
          <p className="font-condensed text-xs font-semibold tracking-[0.2em] text-hive-400 uppercase">
            {t.turnBar.round}
          </p>
          {/* Keyed on the round so it re-mounts, and ticks over, each new turn. */}
          <p
            key={state.turn}
            className="round-tick font-stencil text-5xl leading-none text-hive-200 tabular-nums"
          >
            {String(state.turn).padStart(2, '0')}
          </p>
        </div>

        <p
          aria-live="polite"
          className={`min-w-0 flex-1 font-condensed text-base font-semibold tracking-wide uppercase ${
            pending === 0 && inPlay.length > 0 ? 'text-hazard' : 'text-hive-400'
          }`}
        >
          {status}
          {session?.role === 'host' && (
            <span className="mt-0.5 flex items-center gap-1.5 text-sm text-hive-400">
              <LiveLamp status={live.status} />
              {session.code} · {t.turnBar.watchers(live.viewers)}
            </span>
          )}
        </p>

        {session?.role === 'viewer' ? (
          <p className="flex shrink-0 items-center gap-2 font-condensed text-base font-bold tracking-wider text-hive-200 uppercase">
            <LiveLamp status={live.status} />
            {t.turnBar.watching(session.code)}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => dispatch({ type: 'newTurn' })}
            className="press flex min-h-12 shrink-0 items-center gap-2 rounded-[2px] bg-hazard px-4 font-condensed text-lg font-bold tracking-wider text-hazard-ink uppercase shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_2px_0_var(--plate-shadow)]"
          >
            <ArrowClockwiseIcon aria-hidden size={20} weight="bold" />
            {t.turnBar.newTurn}
          </button>
        )}
      </div>
      <div className="hazard-band" />
    </header>
  )
}
