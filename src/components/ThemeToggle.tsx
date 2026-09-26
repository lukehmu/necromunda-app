import { useEffect } from 'react'
import { useStore } from '@/store'
import type { Theme } from '@/types'

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/** Mirrors the chosen theme onto <html> and the browser chrome colour. */
export function useAppliedTheme(theme: Theme) {
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--surface-950').trim())
    }
  }, [theme])
}

export function ThemeToggle() {
  const { state, dispatch } = useStore()

  return (
    <section className="rounded-xl border border-hive-700 bg-hive-900 p-3">
      <p className="text-xs tracking-widest text-hive-400 uppercase">Theme</p>
      <div className="mt-2 flex gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={state.theme === option.value}
            onClick={() => dispatch({ type: 'setTheme', theme: option.value })}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-semibold transition-colors ${
              state.theme === option.value
                ? 'border-plasma bg-plasma/20 text-plasma'
                : 'border-hive-700 bg-hive-800 text-hive-400 active:bg-hive-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}
