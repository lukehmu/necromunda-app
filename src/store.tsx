import { createContext, type ReactNode, useContext, useEffect, useMemo, useReducer } from 'react'
import { createId } from '@/lib/id'
import { emptyState, loadState, saveState } from '@/lib/storage'
import type { BattleState, Fighter, Flag } from '@/types'

type Action =
  | { type: 'add'; name: string; maxWounds: number }
  | { type: 'remove'; id: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'setMaxWounds'; id: string; maxWounds: number }
  | { type: 'adjustWounds'; id: string; delta: number }
  | { type: 'setWounds'; id: string; wounds: number }
  | { type: 'toggle'; id: string; flag: Flag }
  | { type: 'newTurn' }
  | { type: 'resetBattle' }
  | { type: 'clearAll' }

function mapFighter(state: BattleState, id: string, fn: (f: Fighter) => Fighter): BattleState {
  return { ...state, fighters: state.fighters.map((f) => (f.id === id ? fn(f) : f)) }
}

/** Wounds at zero always means the fighter is down. */
function applyWounds(fighter: Fighter, wounds: number): Fighter {
  const clamped = Math.max(0, Math.min(fighter.maxWounds, Math.round(wounds)))
  return { ...fighter, wounds: clamped, injured: clamped === 0 ? true : fighter.injured }
}

function toggleFlag(fighter: Fighter, flag: Flag, turn: number): Fighter {
  switch (flag) {
    case 'outOfAmmo':
      return { ...fighter, outOfAmmo: !fighter.outOfAmmo }

    case 'injured':
      return { ...fighter, injured: !fighter.injured }

    case 'activated': {
      // Note the turn a suppressed fighter activates, so New Turn can clear it.
      const activated = !fighter.activated
      return {
        ...fighter,
        activated,
        suppressedActivatedTurn: activated && fighter.suppressed ? turn : null,
      }
    }

    case 'suppressed': {
      const suppressed = !fighter.suppressed
      return {
        ...fighter,
        suppressed,
        suppressedActivatedTurn: suppressed && fighter.activated ? turn : null,
      }
    }
  }
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
        injured: false,
        suppressedActivatedTurn: null,
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

    case 'setWounds':
      return mapFighter(state, action.id, (f) => applyWounds(f, action.wounds))

    case 'toggle':
      return mapFighter(state, action.id, (f) => toggleFlag(f, action.flag, state.turn))

    case 'newTurn':
      return {
        ...state,
        turn: state.turn + 1,
        fighters: state.fighters.map((f) => {
          // A suppressed fighter that activated this turn has now spent a full
          // turn active, so the suppression lifts.
          const clears = f.suppressed && f.suppressedActivatedTurn !== null
          return {
            ...f,
            activated: false,
            suppressed: clears ? false : f.suppressed,
            suppressedActivatedTurn: null,
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
          injured: false,
          suppressedActivatedTurn: null,
        })),
      }

    case 'clearAll':
      return emptyState

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
