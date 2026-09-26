import { CaretDownIcon, type Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

interface PanelProps {
  icon: Icon
  title: string
  children: ReactNode
}

/** Collapsible plate used for secondary content below the roster. */
export function Panel({ icon: IconGlyph, title, children }: PanelProps) {
  return (
    <details className="group plate">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-5 font-condensed text-sm font-bold tracking-[0.16em] text-hive-400 uppercase [&::-webkit-details-marker]:hidden">
        <IconGlyph aria-hidden size={18} weight="bold" />
        {title}
        <CaretDownIcon
          aria-hidden
          size={16}
          weight="bold"
          className="ml-auto transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-hive-700 px-5 pt-4 pb-5">{children}</div>
    </details>
  )
}
