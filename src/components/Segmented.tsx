interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset>
      <legend className="font-condensed text-xs font-semibold tracking-[0.14em] text-hive-400 uppercase">
        {label}
      </legend>
      <div className="well mt-1.5 flex gap-1 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`press min-h-10 flex-1 rounded-[2px] px-3 font-condensed text-sm font-bold tracking-wider uppercase ${
              value === option.value
                ? 'bg-hazard text-hazard-ink'
                : 'text-hive-400 active:bg-hive-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
