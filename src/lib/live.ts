import { CODE_PATTERN, type CreateRoomResponse } from '../../shared/protocol'

/** Live games are only offered when the build knows where the Worker is. */
export const LIVE_ENABLED = __SYNC_URL__ !== ''

/** The PartyServer namespace, kebab-cased from the `GameRoom` binding. */
export const PARTY = 'game-room'

export type Session =
  | { role: 'host'; code: string; token: string }
  | { role: 'viewer'; code: string }

const KEY = 'necromunda-session'

export const loadSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Partial<Session> & { token?: unknown }
    if (typeof s.code !== 'string' || !CODE_PATTERN.test(s.code)) return null
    if (s.role === 'host' && typeof s.token === 'string') {
      return { role: 'host', code: s.code, token: s.token }
    }
    if (s.role === 'viewer') return { role: 'viewer', code: s.code }
    return null
  } catch {
    return null
  }
}

export const saveSession = (session: Session | null): void => {
  try {
    if (session) localStorage.setItem(KEY, JSON.stringify(session))
    else localStorage.removeItem(KEY)
  } catch {
    // Unavailable storage just means the session won't survive a reload.
  }
}

/**
 * A `#join=CODE` link opens the app straight into watching that game. The
 * hash is stripped so a reload or a shared screenshot doesn't re-trigger it.
 */
export const takeJoinCodeFromUrl = (): string | null => {
  const match = window.location.hash.match(/^#join=([A-Za-z]+)$/)
  if (!match) return null
  history.replaceState(null, '', window.location.pathname + window.location.search)
  const code = match[1].toUpperCase()
  return CODE_PATTERN.test(code) ? code : null
}

export const joinLink = (code: string): string => {
  return `${window.location.origin}${import.meta.env.BASE_URL}#join=${code}`
}

export class LiveError extends Error {
  readonly reason: 'network' | 'notFound' | 'tooMany'

  constructor(reason: LiveError['reason']) {
    super(reason)
    this.reason = reason
  }
}

const request = async (path: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(`${__SYNC_URL__}${path}`, init)
  } catch {
    throw new LiveError('network')
  }
}

export const createRoom = async (): Promise<CreateRoomResponse> => {
  const response = await request('/rooms', { method: 'POST' })
  if (response.status === 429) throw new LiveError('tooMany')
  if (!response.ok) throw new LiveError('network')
  return (await response.json()) as CreateRoomResponse
}

export const roomExists = async (code: string): Promise<boolean> => {
  const response = await request(`/rooms/${code}`)
  if (response.status === 404) return false
  if (!response.ok) throw new LiveError('network')
  return true
}
