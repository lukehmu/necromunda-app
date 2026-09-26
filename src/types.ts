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
  injured: boolean
  /**
   * Turn number during which this fighter activated while suppressed. Used to
   * clear suppression once they have been active for one full turn.
   */
  suppressedActivatedTurn: number | null
}

export interface BattleState {
  version: 1
  turn: number
  fighters: Fighter[]
}

export type Flag = 'activated' | 'suppressed' | 'outOfAmmo' | 'injured'
