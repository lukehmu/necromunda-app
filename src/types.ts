/**
 * Which edition's pinning-recovery rule the tracker enforces.
 *
 * - `lrb` (classic Living Rulebook, p.12): a fighter pinned at the start of a
 *   turn misses that turn and automatically recovers at the end of it.
 *   Recovery is not tied to activating.
 * - `n18` (2018 rules): a pinned fighter is Prone, and clears the condition by
 *   spending an activation on a Stand Up action.
 */
export type RuleSet = 'lrb' | 'n18'

export type Theme = 'system' | 'light' | 'dark'

/**
 * Result of the Injury dice once a fighter is reduced to zero wounds.
 * Flesh wounds are tracked separately because they stack and leave the fighter
 * on their feet.
 */
export type Condition = 'ok' | 'down' | 'out'

export interface Fighter {
  id: string
  name: string
  /** Wounds on the fighter's card. */
  maxWounds: number
  /** Wounds remaining right now. */
  wounds: number
  activated: boolean
  suppressed: boolean
  outOfAmmo: boolean
  condition: Condition
  /** Each flesh wound is a cumulative -1 to WS and BS. */
  fleshWounds: number
  /** Turn on which the fighter became suppressed, used to time LRB recovery. */
  suppressedSinceTurn: number | null
}

export interface BattleState {
  version: 3
  rules: RuleSet
  theme: Theme
  turn: number
  fighters: Fighter[]
}

export type Flag = 'activated' | 'suppressed' | 'outOfAmmo'
