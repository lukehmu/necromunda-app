import { useEffect } from 'react'
import { Segmented } from '@/components/Segmented'
import { useStore } from '@/store'
import type { Theme } from '@/types'

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
    <Segmented
      label="Theme"
      value={state.theme}
      options={[
        { value: 'system', label: 'System' },
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ]}
      onChange={(theme) => dispatch({ type: 'setTheme', theme })}
    />
  )
}
