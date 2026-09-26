import { FlagChip } from '@/components/FlagChip'
import { clearsThisTurn, useStore } from '@/store'
import type { Fighter } from '@/types'

const woundBarClass = (fighter: Fighter) => {
  if (fighter.wounds === 0) return 'bg-blood'
  if (fighter.wounds < fighter.maxWounds) return 'bg-rust'
  return 'bg-toxin'
}

export function FighterCard({ fighter }: { fighter: Fighter }) {
  const { state, dispatch } = useStore()
  const down = fighter.wounds === 0
  const out = fighter.condition === 'out'
  const recovering = clearsThisTurn(fighter, state.rules, state.turn)

  return (
    <li
      className={`rounded-xl border bg-hive-900 p-3 transition-opacity ${
        out
          ? 'border-hive-700 opacity-40'
          : fighter.activated
            ? 'border-hive-700 opacity-60'
            : 'border-hive-600'
      }`}
    >
      <div className="flex items-start gap-2">
        <input
          value={fighter.name}
          aria-label="Fighter name"
          onChange={(e) => dispatch({ type: 'rename', id: fighter.id, name: e.target.value })}
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 text-lg font-semibold text-hive-200 outline-none focus:bg-hive-800"
        />
        <button
          type="button"
          aria-label={`Remove ${fighter.name}`}
          onClick={() => dispatch({ type: 'remove', id: fighter.id })}
          className="min-h-11 shrink-0 rounded-lg px-3 text-hive-400 active:bg-hive-800"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          aria-label={`Lose a wound: ${fighter.name}`}
          onClick={() => dispatch({ type: 'adjustWounds', id: fighter.id, delta: -1 })}
          disabled={down}
          className="size-12 shrink-0 rounded-lg border border-hive-600 bg-hive-800 text-2xl leading-none font-bold text-hive-200 active:bg-hive-700 disabled:opacity-30"
        >
          −
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className={`text-2xl font-bold ${down ? 'text-blood' : 'text-hive-200'}`}>
              {fighter.wounds}
            </span>
            <span className="text-hive-400">/</span>
            <input
              type="number"
              min={1}
              max={20}
              value={fighter.maxWounds}
              aria-label="Total wounds"
              onChange={(e) =>
                dispatch({
                  type: 'setMaxWounds',
                  id: fighter.id,
                  maxWounds: Number(e.target.value),
                })
              }
              className="w-12 rounded-md bg-transparent py-1 text-hive-400 outline-none focus:bg-hive-800"
            />
            <span className="ml-auto text-xs tracking-wide text-hive-400 uppercase">wounds</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-hive-800">
            <div
              className={`h-full transition-all ${woundBarClass(fighter)}`}
              style={{ width: `${(fighter.wounds / fighter.maxWounds) * 100}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          aria-label={`Restore a wound: ${fighter.name}`}
          onClick={() => dispatch({ type: 'adjustWounds', id: fighter.id, delta: 1 })}
          disabled={fighter.wounds >= fighter.maxWounds}
          className="size-12 shrink-0 rounded-lg border border-hive-600 bg-hive-800 text-2xl leading-none font-bold text-hive-200 active:bg-hive-700 disabled:opacity-30"
        >
          +
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <FlagChip
          label="Activated"
          active={fighter.activated}
          activeClass="border-plasma bg-plasma/20 text-plasma"
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'activated' })}
        />
        <FlagChip
          label="Suppressed"
          active={fighter.suppressed}
          activeClass="border-toxin bg-toxin/20 text-toxin"
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'suppressed' })}
        />
        <FlagChip
          label="No ammo"
          active={fighter.outOfAmmo}
          activeClass="border-rust bg-rust/20 text-rust"
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'outOfAmmo' })}
        />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="w-12 shrink-0 text-xs tracking-wide text-hive-400 uppercase">Injury</span>
        <FlagChip
          label={fighter.fleshWounds > 0 ? `Flesh ×${fighter.fleshWounds}` : 'Flesh wound'}
          active={fighter.fleshWounds > 0}
          activeClass="border-rust bg-rust/20 text-rust"
          onToggle={() => dispatch({ type: 'adjustFleshWounds', id: fighter.id, delta: 1 })}
        />
        {fighter.fleshWounds > 0 && (
          <button
            type="button"
            aria-label={`Remove a flesh wound: ${fighter.name}`}
            onClick={() => dispatch({ type: 'adjustFleshWounds', id: fighter.id, delta: -1 })}
            className="min-h-11 shrink-0 rounded-lg border border-hive-700 bg-hive-800 px-3 text-hive-400 active:bg-hive-700"
          >
            −
          </button>
        )}
        <FlagChip
          label="Down"
          active={fighter.condition === 'down'}
          activeClass="border-blood bg-blood/20 text-blood"
          onToggle={() => dispatch({ type: 'setCondition', id: fighter.id, condition: 'down' })}
        />
        <FlagChip
          label="Out"
          active={out}
          activeClass="border-blood bg-blood text-hive-950"
          onToggle={() => dispatch({ type: 'setCondition', id: fighter.id, condition: 'out' })}
        />
      </div>

      {fighter.fleshWounds > 0 && !out && (
        <p className="mt-2 text-xs text-rust">
          −{fighter.fleshWounds} to WS and BS from flesh wounds.
        </p>
      )}

      {fighter.suppressed && !out && (
        <p className="mt-2 text-xs text-toxin">
          {state.rules === 'n18'
            ? 'Prone — activating stands them up.'
            : recovering
              ? 'Misses this turn, then stands up when the turn ends.'
              : 'Stands up at the end of next turn.'}
        </p>
      )}
    </li>
  )
}
