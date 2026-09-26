import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import { t } from '@/i18n/en'
import { createId } from '@/lib/id'
import { emptyState, loadState, saveState } from '@/lib/storage'
import type { BattleState, Fighter, Flag, Theme } from '@/types'
import { type Live, useLive } from '@/useLive'

type Action =
  | { type: 'add'; name: string; maxWounds: number }
  | { type: 'remove'; id: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'setMaxWounds'; id: string; maxWounds: number }
  | { type: 'adjustWounds'; id: string; delta: number }
  | { type: 'toggle'; id: string; flag: Flag }
  | { type: 'setTheme'; theme: Theme }
  | { type: 'newTurn' }
  | { type: 'resetBattle' }
  | { type: 'clearAll' }

const mapFighter = (state: BattleState, id: string, fn: (f: Fighter) => Fighter): BattleState => {
  return { ...state, fighters: state.fighters.map((f) => (f.id === id ? fn(f) : f)) }
}

/**
 * Injured is defined as being on zero wounds (2026 quick reference), so it
 * follows the wound count across zero in both directions. It only changes on
 * those transitions, so a manual toggle is not undone by unrelated edits.
 */
const applyWounds = (fighter: Fighter, wounds: number): Fighter => {
  const clamped = Math.max(0, Math.min(fighter.maxWounds, Math.round(wounds)))
  let injured = fighter.injured
  if (clamped === 0 && fighter.wounds > 0) injured = true
  else if (clamped > 0 && fighter.wounds === 0) injured = false
  return { ...fighter, wounds: clamped, injured }
}

const toggleFlag = (fighter: Fighter, flag: Flag): Fighter => {
  if (flag === 'activated') {
    const activated = !fighter.activated
    // Suppression costs one action and lifts at the end of the activation, so
    // marking the fighter activated is the moment it clears.
    return { ...fighter, activated, suppressed: activated ? false : fighter.suppressed }
  }
  return { ...fighter, [flag]: !fighter[flag] }
}

export const reducer = (state: BattleState, action: Action): BattleState => {
  switch (action.type) {
    case 'add': {
      const maxWounds = Math.max(1, Math.round(action.maxWounds))
      const fighter: Fighter = {
        id: createId(),
        name: action.name.trim() || t.addFighter.defaultName,
        maxWounds,
        wounds: maxWounds,
        activated: false,
        suppressed: false,
        outOfAmmo: false,
        injured: false,
      }
      return { ...state, fighters: [...state.fighters, fighter] }
    }

    case 'remove':
      return { ...state, fighters: state.fighters.filter((f) => f.id !== action.id) }

    case 'rename':
      return mapFighter(state, action.id, (f) => ({ ...f, name: action.name }))

    case 'setMaxWounds':
      return mapFighter(state, action.id, (f) => {
        const maxWounds = Math.max(1, Math.round(action.maxWounds))
        return applyWounds({ ...f, maxWounds }, Math.min(f.wounds, maxWounds))
      })

    case 'adjustWounds':
      return mapFighter(state, action.id, (f) => applyWounds(f, f.wounds + action.delta))

    case 'toggle':
      return mapFighter(state, action.id, (f) => toggleFlag(f, action.flag))

    case 'setTheme':
      return { ...state, theme: action.theme }

    case 'newTurn':
      return {
        ...state,
        turn: state.turn + 1,
        fighters: state.fighters.map((f) => ({ ...f, activated: false })),
      }

    case 'resetBattle':
      return {
        ...state,
        turn: 1,
        fighters: state.fighters.map((f) => ({
          ...f,
          wounds: f.maxWounds,
          activated: false,
          suppressed: false,
          outOfAmmo: false,
          injured: false,
        })),
      }

    case 'clearAll':
      return { ...emptyState, theme: state.theme }

    default:
      return state
  }
}

interface Store {
  /** What to show: this device's game, or the host's while watching one. */
  state: BattleState
  dispatch: React.Dispatch<Action>
  /** Watching someone else's game: every control is locked. */
  readOnly: boolean
}

const StoreContext = createContext<Store | null>(null)
const LiveContext = createContext<Live | null>(null)

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const shared = useMemo(
    () => ({ turn: state.turn, fighters: state.fighters }),
    [state.turn, state.fighters],
  )
  const live = useLive(shared)
  const readOnly = live.session?.role === 'viewer'

  // A viewer's own game is left untouched in `state` and in storage, and comes
  // back when they stop watching. Only the theme stays local and editable.
  const shown = useMemo<BattleState>(
    () =>
      readOnly
        ? { ...state, turn: live.remote?.turn ?? 1, fighters: live.remote?.fighters ?? [] }
        : state,
    [readOnly, state, live.remote],
  )

  const guardedDispatch = useCallback<React.Dispatch<Action>>(
    (action) => {
      if (!readOnly || action.type === 'setTheme') dispatch(action)
    },
    [readOnly],
  )

  const value = useMemo(
    () => ({ state: shown, dispatch: guardedDispatch, readOnly }),
    [shown, guardedDispatch, readOnly],
  )

  return (
    <StoreContext.Provider value={value}>
      <LiveContext.Provider value={live}>{children}</LiveContext.Provider>
    </StoreContext.Provider>
  )
}

export const useStore = (): Store => {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}

export const useLiveGame = (): Live => {
  const live = useContext(LiveContext)
  if (!live) throw new Error('useLiveGame must be used inside <StoreProvider>')
  return live
}
