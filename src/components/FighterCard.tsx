import {
  CrosshairSimpleIcon,
  FirstAidIcon,
  LightningIcon,
  MinusIcon,
  PlusIcon,
  ProhibitIcon,
  XIcon,
} from '@phosphor-icons/react'
import { ConfirmButton } from '@/components/ConfirmButton'
import { Toggle } from '@/components/Toggle'
import { t } from '@/i18n/en'
import { useStore } from '@/store'
import type { Fighter, Flag } from '@/types'

/** Beyond this many wounds a pip row stops being readable at a glance. */
const MAX_PIPS = 10

const WoundPips = ({ fighter }: { fighter: Fighter }) => {
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

const StepButton = ({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) => {
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

/** Flags with a rules reminder, in display order. Copy lives in `t.tips`. */
const TIP_FLAGS = [
  { flag: 'suppressed', className: 'text-toxin' },
  { flag: 'outOfAmmo', className: 'text-hive-400' },
  { flag: 'injured', className: 'text-blood' },
] as const satisfies readonly { flag: Exclude<Flag, 'activated'>; className: string }[]

export const FighterCard = ({ fighter }: { fighter: Fighter }) => {
  const { dispatch, readOnly } = useStore()
  const zero = fighter.wounds === 0
  const tips = TIP_FLAGS.filter((tip) => fighter[tip.flag])

  return (
    <li
      className={`plate px-4 pt-3 pb-4 transition-opacity ${fighter.activated ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-2 pl-2">
        <input
          value={fighter.name}
          aria-label={t.fighter.nameLabel}
          onChange={(e) => dispatch({ type: 'rename', id: fighter.id, name: e.target.value })}
          className="min-w-0 flex-1 rounded-[2px] bg-transparent py-1 font-condensed text-xl font-bold tracking-wide text-hive-200 uppercase outline-none focus:bg-hive-800"
        />
        {!readOnly && (
          <ConfirmButton
            idleAriaLabel={t.fighter.remove(fighter.name)}
            idleClassName="press grid size-10 shrink-0 place-items-center rounded-[2px] text-hive-400 active:bg-hive-800"
            confirmLabel={t.fighter.removeConfirm}
            confirmAriaLabel={t.fighter.confirmRemove(fighter.name)}
            onConfirm={() => dispatch({ type: 'remove', id: fighter.id })}
          >
            <XIcon size={18} weight="bold" />
          </ConfirmButton>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        {!readOnly && (
          <StepButton
            label={t.fighter.loseWound(fighter.name)}
            disabled={zero}
            onClick={() => dispatch({ type: 'adjustWounds', id: fighter.id, delta: -1 })}
          >
            <MinusIcon size={22} weight="bold" />
          </StepButton>
        )}

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
              aria-label={t.fighter.totalWoundsLabel}
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
              {t.fighter.wounds}
            </span>
          </div>
          <WoundPips fighter={fighter} />
        </div>

        {!readOnly && (
          <StepButton
            label={t.fighter.restoreWound(fighter.name)}
            disabled={fighter.wounds >= fighter.maxWounds}
            onClick={() => dispatch({ type: 'adjustWounds', id: fighter.id, delta: 1 })}
          >
            <PlusIcon size={22} weight="bold" />
          </StepButton>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Toggle
          label={t.flags.activated}
          icon={LightningIcon}
          tone="hazard"
          active={fighter.activated}
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'activated' })}
        />
        <Toggle
          label={t.flags.suppressed}
          icon={CrosshairSimpleIcon}
          tone="toxin"
          active={fighter.suppressed}
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'suppressed' })}
        />
        <Toggle
          label={t.flags.outOfAmmo}
          icon={ProhibitIcon}
          tone="steel"
          active={fighter.outOfAmmo}
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'outOfAmmo' })}
        />
        <Toggle
          label={t.flags.injured}
          icon={FirstAidIcon}
          tone="blood"
          active={fighter.injured}
          onToggle={() => dispatch({ type: 'toggle', id: fighter.id, flag: 'injured' })}
        />
      </div>

      {tips.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-hive-700 pt-2 text-sm">
          {tips.map((tip) => (
            <li key={tip.flag} className={tip.className}>
              {t.tips[tip.flag]}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
