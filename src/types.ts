export type Theme = 'system' | 'light' | 'dark'

export interface Fighter {
  id: string
  name: string
  /** Wounds on the fighter's card. */
  maxWounds: number
  /** Wounds remaining right now. */
  wounds: number
  activated: boolean
  /**
   * Necromunda (2026): a suppressed fighter loses one action on their next
   * activation and recovers at the end of it.
   */
  suppressed: boolean
  outOfAmmo: boolean
  /** Back on their feet on zero wounds. Being down is shown on the table. */
  injured: boolean
}

export interface BattleState {
  version: 4
  theme: Theme
  turn: number
  fighters: Fighter[]
}

export type Flag = 'activated' | 'suppressed' | 'outOfAmmo' | 'injured'
