import { TrashIcon } from '@phosphor-icons/react'
import { type ReactNode, useEffect, useState } from 'react'
import { t } from '@/i18n/en'

/** How long a confirmation stays armed before quietly backing off. */
const CONFIRM_MS = 4000

interface ConfirmButtonProps {
  /** Content of the button before it is armed. */
  children: ReactNode
  idleClassName: string
  idleAriaLabel?: string
  /** Label on the destructive button once armed. */
  confirmLabel: string
  confirmAriaLabel?: string
  /** Optional consequence, shown under the buttons while armed. */
  prompt?: string
  onConfirm: () => void
}

/**
 * Two-step destructive action: the first tap arms it, the second commits.
 * Inline rather than a native confirm() so it stays quick at the table, never
 * blocks the page, and matches the rest of the UI.
 */
export function ConfirmButton({
  children,
  idleClassName,
  idleAriaLabel,
  confirmLabel,
  confirmAriaLabel,
  prompt,
  onConfirm,
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [armed])

  if (!armed) {
    return (
      <button
        type="button"
        aria-label={idleAriaLabel}
        onClick={() => setArmed(true)}
        className={idleClassName}
      >
        {children}
      </button>
    )
  }

  return (
    <div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="press well min-h-10 flex-1 px-3 font-condensed text-sm font-bold tracking-wider text-hive-200 uppercase"
        >
          {t.common.keep}
        </button>
        <button
          type="button"
          // biome-ignore lint/a11y/noAutofocus: focus follows the tap that armed it
          autoFocus
          aria-label={confirmAriaLabel}
          onClick={() => {
            setArmed(false)
            onConfirm()
          }}
          className="press flex min-h-10 flex-1 items-center justify-center gap-1 rounded-[2px] bg-blood px-3 font-condensed text-sm font-bold tracking-wider whitespace-nowrap text-hive-950 uppercase"
        >
          <TrashIcon aria-hidden size={16} weight="bold" />
          {confirmLabel}
        </button>
      </div>
      {prompt && <p className="mt-1.5 text-sm text-blood">{prompt}</p>}
    </div>
  )
}
