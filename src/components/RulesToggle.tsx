import { useStore } from '@/store'
import type { RuleSet } from '@/types'

const OPTIONS: { value: RuleSet; label: string; hint: string }[] = [
  {
    value: 'lrb',
    label: 'Classic LRB',
    hint: 'Suppressed fighters miss a turn, then stand up automatically at the end of it.',
  },
  {
    value: 'n18',
    label: 'N18',
    hint: 'Suppressed fighters are prone; activating them is the Stand Up action, which clears it.',
  },
]

export function RulesToggle() {
  const { state, dispatch } = useStore()
  const active = OPTIONS.find((o) => o.value === state.rules) ?? OPTIONS[0]

  return (
    <section className="rounded-xl border border-hive-700 bg-hive-900 p-3">
      <p className="text-xs tracking-widest text-hive-400 uppercase">Suppression recovery</p>
      <div className="mt-2 flex gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={state.rules === option.value}
            onClick={() => dispatch({ type: 'setRules', rules: option.value })}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-semibold transition-colors ${
              state.rules === option.value
                ? 'border-plasma bg-plasma/20 text-plasma'
                : 'border-hive-700 bg-hive-800 text-hive-400 active:bg-hive-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-hive-400">{active.hint}</p>
    </section>
  )
}
