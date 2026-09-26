import type { BattleState } from '@/types'

const KEY = 'necromunda-tracker'

export const emptyState: BattleState = { version: 1, turn: 1, fighters: [] }

export function loadState(): BattleState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw) as Partial<BattleState>
    if (parsed.version !== 1 || !Array.isArray(parsed.fighters)) return emptyState
    return {
      version: 1,
      turn: typeof parsed.turn === 'number' && parsed.turn > 0 ? parsed.turn : 1,
      fighters: parsed.fighters,
    }
  } catch {
    return emptyState
  }
}

export function saveState(state: BattleState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable (private mode) — tracking still works in memory.
  }
}
