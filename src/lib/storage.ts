import type { BattleState, Fighter, Theme } from '@/types'

const KEY = 'necromunda-tracker'

export const emptyState: BattleState = { version: 4, theme: 'system', turn: 1, fighters: [] }

const num = (value: unknown, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/**
 * Tolerate partial fighters and every earlier shape. v3 tracked
 * `condition` ('ok' | 'down' | 'out') and flesh wounds; any injury there
 * collapses to the single `injured` flag.
 */
export const normaliseFighter = (raw: unknown): Fighter | null => {
  if (!raw || typeof raw !== 'object') return null
  const f = raw as Record<string, unknown>
  if (typeof f.id !== 'string' || typeof f.name !== 'string') return null

  const maxWounds = Math.max(1, Math.round(num(f.maxWounds, 1)))
  const wounds = Math.max(0, Math.min(maxWounds, Math.round(num(f.wounds, maxWounds))))

  return {
    id: f.id,
    name: f.name,
    maxWounds,
    wounds,
    activated: f.activated === true,
    suppressed: f.suppressed === true,
    outOfAmmo: f.outOfAmmo === true,
    injured: f.injured === true || f.condition === 'down' || f.condition === 'out' || wounds === 0,
  }
}

/** Fighters from any untrusted source: storage, or a live game's host. */
export const normaliseFighters = (raw: unknown[]): Fighter[] => {
  return raw.map(normaliseFighter).filter((f): f is Fighter => f !== null)
}

export const loadState = (): BattleState => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!Array.isArray(parsed.fighters)) return emptyState

    const theme: Theme =
      parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : 'system'

    return {
      version: 4,
      theme,
      turn: Math.max(1, Math.round(num(parsed.turn, 1))),
      fighters: normaliseFighters(parsed.fighters),
    }
  } catch {
    return emptyState
  }
}

export const saveState = (state: BattleState): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable (private mode): tracking still works in memory.
  }
}
