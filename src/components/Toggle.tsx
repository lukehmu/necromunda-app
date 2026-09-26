import type { Icon } from '@phosphor-icons/react'

export type Tone = 'hazard' | 'toxin' | 'blood' | 'steel' | 'blood-solid'

const ON: Record<Tone, string> = {
  hazard: 'border-hazard text-hazard bg-hazard/12',
  toxin: 'border-toxin text-toxin bg-toxin/12',
  blood: 'border-blood text-blood bg-blood/12',
  'blood-solid': 'border-blood bg-blood text-hive-950',
  steel: 'border-hive-400 text-hive-200 bg-hive-600/40',
}

/** Indicator lamp colour: a lit lamp is the toggle's real on/off state. */
const LAMP: Record<Tone, string> = {
  hazard: 'bg-hazard',
  toxin: 'bg-toxin',
  blood: 'bg-blood',
  'blood-solid': 'bg-hive-950',
  steel: 'bg-hive-200',
}

interface ToggleProps {
  label: string
  active: boolean
  tone: Tone
  icon?: Icon
  onToggle: () => void
}

export function Toggle({ label, active, tone, icon: IconGlyph, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`press flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[2px] border px-1.5 py-1.5 font-condensed text-[0.9rem] leading-none font-bold tracking-wide uppercase ${
        active ? ON[tone] : 'well text-hive-400'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className={`size-1.5 shrink-0 rounded-[1px] ${active ? LAMP[tone] : 'bg-hive-600'}`}
        />
        {IconGlyph && <IconGlyph aria-hidden size={17} weight="bold" className="shrink-0" />}
      </span>
      <span className="max-w-full truncate">{label}</span>
    </button>
  )
}
