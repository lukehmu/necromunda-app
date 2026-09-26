import { createContext, type ReactNode, useContext, useEffect, useMemo, useReducer } from 'react'
import { createId } from '@/lib/id'
import { emptyState, loadState, saveState } from '@/lib/storage'
import type { BattleState, Condition, Fighter, Flag, RuleSet, Theme } from '@/types'

type Action =
  | { type: 'add'; name: string; maxWounds: number }
  | { type: 'remove'; id: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'setMaxWounds'; id: string; maxWounds: number }
  | { type: 'adjustWounds'; id: string; delta: number }
  | { type: 'toggle'; id: string; flag: Flag }
  | { type: 'setCondition'; id: string; condition: Condition }
  | { type: 'adjustFleshWounds'; id: string; delta: number }
  | { type: 'setRules'; rules: RuleSet }
  | { type: 'setTheme'; theme: Theme }
  | { type: 'newTurn' }
  | { type: 'resetBattle' }
  | { type: 'clearAll' }

function mapFighter(state: BattleState, id: string, fn: (f: Fighter) => Fighter): BattleState {
  return { ...state, fighters: state.fighters.map((f) => (f.id === id ? fn(f) : f)) }
}

/**
 * A fighter reduced to zero wounds is taken down by default — that is the
 * likeliest Injury dice result. Swap it for a flesh wound or out of action
 * once the dice is actually read.
 */
function applyWounds(fighter: Fighter, wounds: number): Fighter {
  const clamped = Math.max(0, Math.min(fighter.maxWounds, Math.round(wounds)))
  const condition =
    clamped === 0 && fighter.wounds > 0 && fighter.condition === 'ok' ? 'down' : fighter.condition
  return { ...fighter, wounds: clamped, condition }
}

function toggleFlag(fighter: Fighter, flag: Flag, state: BattleState): Fighter {
  switch (flag) {
    case 'outOfAmmo':
      return { ...fighter, outOfAmmo: !fighter.outOfAmmo }

    case 'activated': {
      const activated = !fighter.activated
      // N18: standing up is the activation, so suppression lifts there and then.
      const clears = state.rules === 'n18' && activated && fighter.suppressed
      return {
        ...fighter,
        activated,
        suppressed: clears ? false : fighter.suppressed,
        suppressedSinceTurn: clears ? null : fighter.suppressedSinceTurn,
      }
    }

    case 'suppressed': {
      const suppressed = !fighter.suppressed
      return {
        ...fighter,
        suppressed,
        suppressedSinceTurn: suppressed ? state.turn : null,
      }
    }
  }
}

/**
 * LRB p.12: a fighter pinned at the start of a turn misses that turn and stands
 * up at the end of it. So suppression applied during turn N is still in play for
 * the whole of turn N+1, and clears as turn N+1 ends.
 */
export function clearsThisTurn(fighter: Fighter, rules: RuleSet, turn: number): boolean {
  if (rules !== 'lrb') return false
  return (
    fighter.suppressed && fighter.suppressedSinceTurn !== null && fighter.suppressedSinceTurn < turn
  )
}

export function reducer(state: BattleState, action: Action): BattleState {
  switch (action.type) {
    case 'add': {
      const maxWounds = Math.max(1, Math.round(action.maxWounds))
      const fighter: Fighter = {
        id: createId(),
        name: action.name.trim() || 'Unnamed fighter',
        maxWounds,
        wounds: maxWounds,
        activated: false,
        suppressed: false,
        outOfAmmo: false,
        condition: 'ok',
        fleshWounds: 0,
        suppressedSinceTurn: null,
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
      return mapFighter(state, action.id, (f) => toggleFlag(f, action.flag, state))

    case 'setCondition':
      return mapFighter(state, action.id, (f) => ({
        ...f,
        condition: f.condition === action.condition ? 'ok' : action.condition,
      }))

    case 'adjustFleshWounds':
      return mapFighter(state, action.id, (f) => ({
        ...f,
        fleshWounds: Math.max(0, f.fleshWounds + action.delta),
      }))

    case 'setRules':
      return { ...state, rules: action.rules }

    case 'setTheme':
      return { ...state, theme: action.theme }

    case 'newTurn':
      return {
        ...state,
        turn: state.turn + 1,
        fighters: state.fighters.map((f) => {
          const recovers = clearsThisTurn(f, state.rules, state.turn)
          return {
            ...f,
            activated: false,
            suppressed: recovers ? false : f.suppressed,
            suppressedSinceTurn: recovers ? null : f.suppressedSinceTurn,
          }
        }),
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
          condition: 'ok',
          fleshWounds: 0,
          suppressedSinceTurn: null,
        })),
      }

    case 'clearAll':
      return { ...emptyState, rules: state.rules, theme: state.theme }

    default:
      return state
  }
}

interface Store {
  state: BattleState
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}
