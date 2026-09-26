/**
 * Wire protocol between the app and the sync Worker. Imported by both sides,
 * so a change here is a change to both.
 *
 * One host writes, any number of viewers read. The host sends the whole shared
 * state after every change (it is ~1KB), and the room keeps the latest copy so
 * late joiners get it immediately. No merging: last write wins, and there is
 * only one writer.
 */

/** Room codes avoid I and O so they can't be misread as 1 and 0. */
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
export const CODE_LENGTH = 4
export const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`)

/** Hard cap on a state message. A full gang is a few KB at most. */
export const MAX_MESSAGE_BYTES = 32 * 1024

/** Keep-alive. The Worker answers without waking the Durable Object. */
export const PING = 'ping'
export const PONG = 'pong'

/**
 * The part of the app state that is shared. Per-device preferences such as the
 * theme are deliberately not in here.
 */
export interface SharedState {
  turn: number
  fighters: unknown[]
}

export interface CreateRoomResponse {
  code: string
  hostToken: string
}

export type ClientMessage =
  | { type: 'auth'; token: string }
  | { type: 'state'; state: SharedState }
  | { type: 'end' }

export type ServerMessage =
  | { type: 'state'; state: SharedState }
  | { type: 'role'; role: 'host' }
  | { type: 'presence'; viewers: number }
  | { type: 'ended' }
  | { type: 'error'; code: 'bad-token' | 'not-host' | 'invalid' }

/** Minimal structural check, shared so both ends reject the same junk. */
export const isSharedState = (value: unknown): value is SharedState => {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.turn === 'number' &&
    Number.isFinite(v.turn) &&
    Array.isArray(v.fighters) &&
    v.fighters.length <= 100
  )
}
