interface FlagChipProps {
  label: string
  active: boolean
  activeClass: string
  onToggle: () => void
}

export function FlagChip({ label, active, activeClass, onToggle }: FlagChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`min-h-11 flex-1 rounded-lg border px-2 py-2 text-xs font-semibold tracking-wide uppercase transition-colors ${
        active ? activeClass : 'border-hive-700 bg-hive-800 text-hive-400 active:bg-hive-700'
      }`}
    >
      {label}
    </button>
  )
}
