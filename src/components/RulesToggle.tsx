import { Segmented } from '@/components/Segmented'
import { useStore } from '@/store'
import type { RuleSet } from '@/types'

const HINTS: Record<RuleSet, string> = {
  lrb: 'Suppressed fighters miss a turn, then stand up by themselves when it ends.',
  n18: 'Suppressed fighters are prone. Activating them is the Stand Up action, which clears it.',
}

export function RulesToggle() {
  const { state, dispatch } = useStore()

  return (
    <div>
      <Segmented
        label="Suppression recovery"
        value={state.rules}
        options={[
          { value: 'lrb', label: 'Classic LRB' },
          { value: 'n18', label: 'N18' },
        ]}
        onChange={(rules) => dispatch({ type: 'setRules', rules })}
      />
      <p className="mt-2 text-sm text-hive-400">{HINTS[state.rules]}</p>
    </div>
  )
}
