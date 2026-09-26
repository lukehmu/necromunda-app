import usePartySocket from 'partysocket/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createRoom,
  LIVE_ENABLED,
  LiveError,
  loadSession,
  PARTY,
  roomExists,
  type Session,
  saveSession,
  takeJoinCodeFromUrl,
} from '@/lib/live'
import { normaliseFighters } from '@/lib/storage'
import type { Fighter } from '@/types'
import {
  type ClientMessage,
  isSharedState,
  PING,
  type ServerMessage,
  type SharedState,
} from '../shared/protocol'

/** Keep-alive interval. Mobile networks drop idle sockets without telling anyone. */
const PING_MS = 25_000

export type LiveStatus = 'connecting' | 'live' | 'offline'

/** Why the last session ended, or why starting one failed. */
export type LiveNotice = 'ended' | 'notFound' | 'network' | 'tooMany' | 'badToken'

export interface RemoteGame {
  turn: number
  fighters: Fighter[]
}

export interface Live {
  enabled: boolean
  session: Session | null
  status: LiveStatus
  /** Viewers connected to the room, as reported by the Worker. */
  viewers: number
  /** The host's game, when this device is watching. */
  remote: RemoteGame | null
  notice: LiveNotice | null
  busy: boolean
  share: () => Promise<void>
  join: (code: string) => Promise<void>
  /** Host: end the game for everyone. Viewer: stop watching. */
  leave: () => void
}

const initialSession = (): Session | null => {
  const joinCode = takeJoinCodeFromUrl()
  if (joinCode) {
    const session: Session = { role: 'viewer', code: joinCode }
    saveSession(session)
    return session
  }
  return loadSession()
}

/**
 * Connects this device to a live game. As host it pushes `shared` after every
 * change; as viewer it exposes the host's game as `remote`. The socket itself
 * (reconnect with backoff, buffering while offline) is partysocket's job.
 */
export const useLive = (shared: SharedState): Live => {
  const [session, setSessionState] = useState<Session | null>(() =>
    LIVE_ENABLED ? initialSession() : null,
  )
  const [status, setStatus] = useState<LiveStatus>('connecting')
  const [viewers, setViewers] = useState(0)
  const [remote, setRemote] = useState<RemoteGame | null>(null)
  const [notice, setNotice] = useState<LiveNotice | null>(null)
  const [busy, setBusy] = useState(false)

  // Handlers run outside render, so they read the latest values through refs.
  const sessionRef = useRef(session)
  sessionRef.current = session
  const sharedRef = useRef(shared)
  sharedRef.current = shared

  const setSession = useCallback((next: Session | null) => {
    saveSession(next)
    setSessionState(next)
    setRemote(null)
    setViewers(0)
    setStatus('connecting')
  }, [])

  const socket = usePartySocket({
    host: __SYNC_URL__ || 'localhost',
    party: PARTY,
    room: session?.code ?? 'none',
    enabled: session !== null,
    onOpen() {
      setStatus('live')
      const current = sessionRef.current
      if (current?.role === 'host') {
        send({ type: 'auth', token: current.token })
        send({ type: 'state', state: sharedRef.current })
      }
    },
    onMessage(event) {
      if (typeof event.data !== 'string' || event.data === 'pong') return
      let message: ServerMessage
      try {
        message = JSON.parse(event.data) as ServerMessage
      } catch {
        return
      }
      switch (message.type) {
        case 'state':
          if (sessionRef.current?.role === 'viewer' && isSharedState(message.state)) {
            setRemote({
              turn: Math.max(1, Math.round(message.state.turn)),
              fighters: normaliseFighters(message.state.fighters),
            })
          }
          break
        case 'presence':
          setViewers(message.viewers)
          break
        case 'ended':
          if (sessionRef.current?.role === 'viewer') setNotice('ended')
          setSession(null)
          break
        case 'error':
          if (message.code === 'bad-token') {
            setNotice('badToken')
            setSession(null)
          }
          break
      }
    },
    onClose(event) {
      // 4404: the room was never created or has expired.
      if (event.code === 4404) {
        setNotice('notFound')
        setSession(null)
        return
      }
      setStatus('offline')
    },
  })

  const send = useCallback(
    (message: ClientMessage) => socket.send(JSON.stringify(message)),
    [socket],
  )

  // Host: push every change. The state is small enough to send whole. Only
  // while open: on (re)connect `onOpen` authenticates first, then sends it, so
  // nothing buffered can arrive ahead of the auth message.
  useEffect(() => {
    if (session?.role !== 'host' || socket.readyState !== WebSocket.OPEN) return
    send({ type: 'state', state: shared })
  }, [session, shared, socket, send])

  // A join link tapped while the app is already open only changes the hash.
  useEffect(() => {
    if (!LIVE_ENABLED) return
    const onHash = () => {
      const code = takeJoinCodeFromUrl()
      if (code && sessionRef.current?.code !== code) setSession({ role: 'viewer', code })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [setSession])

  // Keep-alive, and reconnect straight away when a sleeping phone wakes up
  // rather than waiting out the backoff.
  useEffect(() => {
    if (!session) return
    const ping = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.send(PING)
    }, PING_MS)
    const wake = () => {
      if (document.visibilityState === 'visible' && socket.readyState !== WebSocket.OPEN) {
        socket.reconnect()
      }
    }
    document.addEventListener('visibilitychange', wake)
    window.addEventListener('online', wake)
    return () => {
      clearInterval(ping)
      document.removeEventListener('visibilitychange', wake)
      window.removeEventListener('online', wake)
    }
  }, [session, socket])

  const run = useCallback(async (task: () => Promise<void>) => {
    setBusy(true)
    setNotice(null)
    try {
      await task()
    } catch (error) {
      setNotice(error instanceof LiveError ? error.reason : 'network')
    } finally {
      setBusy(false)
    }
  }, [])

  const share = useCallback(
    () =>
      run(async () => {
        const { code, hostToken } = await createRoom()
        setSession({ role: 'host', code, token: hostToken })
      }),
    [run, setSession],
  )

  const join = useCallback(
    (code: string) =>
      run(async () => {
        if (!(await roomExists(code))) throw new LiveError('notFound')
        setSession({ role: 'viewer', code })
      }),
    [run, setSession],
  )

  const leave = useCallback(() => {
    if (sessionRef.current?.role === 'host') send({ type: 'end' })
    setNotice(null)
    setSession(null)
  }, [send, setSession])

  return {
    enabled: LIVE_ENABLED,
    session,
    status,
    viewers,
    remote,
    notice,
    busy,
    share,
    join,
    leave,
  }
}
