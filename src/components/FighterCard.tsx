import {
  ArrowFatLinesDownIcon,
  CrosshairSimpleIcon,
  DropIcon,
  LightningIcon,
  MinusIcon,
  PlusIcon,
  ProhibitIcon,
  SkullIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Toggle } from '@/components/Toggle'
import { clearsThisTurn, useStore } from '@/store'
import type { Fighter } from '@/types'

/** Beyond this many wounds a pip row stops being readable at a glance. */
const MAX_PIPS = 10

function WoundPips({ fighter }: { fighter: Fighter }) {
  if (fighter.maxWounds > MAX_PIPS) return null
  return (
    <div aria-hidden className="mt-1.5 flex flex-wrap gap-1">
      {Array.from({ length: fighter.maxWounds }, (_, i) => {
        const remaining = i < fighter.wounds
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: pips are positional, never reordered
            key={i}
            className={`h-3 w-5 rounded-[1px] border ${
              remaining
                ? 'border-hazard bg-hazard'
                : 'border-blood/70 bg-[repeating-linear-gradient(-45deg,var(--accent-blood)_0_2px,transparent_2px_5px)]'
            }`}
          />
        )
      })}
    </div>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="press well grid size-12 shrink-0 place-items-center text-hive-200 active:bg-hive-700 disabled:opacity-30"
    >
      {children}
    </button>
  )
}

export function FighterCard({ fighter }: { fighter: Fighter }) {
  const { state, dispatch } = useStore()
  const zero = fighter.wounds === 0
  const out = fighter.condition === 'out'
  const recovering = clearsThisTurn(fighter, state.rules, state.turn)

  const suppressionHint =
    state.rules === 'n18'
      ? 'Prone. Activating them stands them up.'
      : recovering
        ? 'Misses this turn. Stands up when it ends.'
        : 'Stands up at the end of next turn.'

  return (
    <li
      className={`plate px-4 pt-3 pb-4 transition-opacity ${
        out ? 'opacity-45 grayscale' : fighter.activated ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-center gap-2 pl-2">
        <input
          value={fighter.name}
          aria-label="Fighter name"
          onChange={(e) => dispatch({ type: 'rename', id: fighter.id, name: e.target.value })}
          className="min-w-0 flex-1 rounded-[2px] bg-transparent py-1 font-condensed text-xl font-bold tracking-wide text-hive-200 uppercase outline-none focus:bg-hive-800"
        />
        {out && (
          <span className="font-condensed text-sm font-bold tracking-widest text-blood uppercase">
            Out of action
          </span>
        )}
        <button
          type="button"
          aria-label={`Remove ${fighter.name}`}
          onClick={() => dispatch({ type: 'remove', id: fighter.id })}
          className="press grid size-10 shrink-0 place-items-center rounded-[2px] text-hive-400 active:bg-hive-800"
        >
          <XIcon size={18} weight="bold" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <StepButton
          label={`Lose a wound: ${fighter.name}`}
          disabled={zero}
          onClick={() => dispatch({ type: 'adjustWounds', id: fighter.id, delta: -1 })}
        >
          <MinusIcon size={22} weight="bold" />
        </StepButton>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-stencil text-4xl leading-none tabular-nums ${
                zero ? 'text-blood' : 'text-hive-200'
              }`}
            >
              {fighter.wounds}
            </span>
            <span className="font-condensed text-lg text-hive-400">/</span>
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
              className="w-10 rounded-[2px] bg-transparent font-condensed text-lg font-semibold text-hive-400 tabular-nums outline-none focus:bg-hive-800"
            />
            <span className="ml-auto font-condensed text-xs font-semibold tracking-[0.14em] text-hive-400 uppercase">
              Wounds
            </span>
          </div>
          <WoundPips fighter={fighter} />
        </div>

        <StepButton
          label={`Restore a wound: ${fighter.name}`}
          disabled={fighter.wounds >= fighter.maxWounds}
          onClick={() => dispatch({ type: 'adjustWounds', id: fighter.id, delta: 1 })}
        >
          <PlusIcon size={22} weight="bold" />
        </StepButton>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Toggle
          label="Activated"
          icon={LightningIcon}
          tone="hazard"
          active={fighter.activated}
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'activated' })}
        />
        <Toggle
          label="Suppressed"
          icon={CrosshairSimpleIcon}
          tone="toxin"
          active={fighter.suppressed}
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'suppressed' })}
        />
        <Toggle
          label="No ammo"
          icon={ProhibitIcon}
          tone="steel"
          active={fighter.outOfAmmo}
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'outOfAmmo' })}
        />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <Toggle
          label={fighter.fleshWounds > 0 ? `Flesh ×${fighter.fleshWounds}` : 'Flesh'}
          icon={DropIcon}
          tone="blood"
          active={fighter.fleshWounds > 0}
          onToggle={() => dispatch({ type: 'adjustFleshWounds', id: fighter.id, delta: 1 })}
        />
        <Toggle
          label="Down"
          icon={ArrowFatLinesDownIcon}
          tone="blood"
          active={fighter.condition === 'down'}
          onToggle={() => dispatch({ type: 'setCondition', id: fighter.id, condition: 'down' })}
        />
        <Toggle
          label="Out"
          icon={SkullIcon}
          tone="blood-solid"
          active={out}
          onToggle={() => dispatch({ type: 'setCondition', id: fighter.id, condition: 'out' })}
        />
      </div>

      {!out && (fighter.fleshWounds > 0 || fighter.suppressed) && (
        <ul className="mt-3 space-y-1 border-t border-hive-700 pt-2 text-sm">
          {fighter.fleshWounds > 0 && (
            <li className="flex items-center gap-3 text-blood">
              <span className="flex-1">-{fighter.fleshWounds} WS and BS from flesh wounds.</span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'adjustFleshWounds', id: fighter.id, delta: -1 })}
                className="press flex min-h-9 shrink-0 items-center gap-1 rounded-[2px] border border-blood/50 px-2 font-condensed text-xs font-bold tracking-wider uppercase active:bg-blood/10"
              >
                <MinusIcon aria-hidden size={12} weight="bold" />
                Remove one
              </button>
            </li>
          )}
          {fighter.suppressed && <li className="text-toxin">{suppressionHint}</li>}
        </ul>
      )}
    </li>
  )
}
