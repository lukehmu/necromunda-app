import { type Connection, getServerByName, routePartykitRequest, Server } from 'partyserver'
import {
  type ClientMessage,
  CODE_ALPHABET,
  CODE_LENGTH,
  CODE_PATTERN,
  type CreateRoomResponse,
  isSharedState,
  MAX_MESSAGE_BYTES,
  PING,
  PONG,
  type ServerMessage,
  type SharedState,
} from '../../shared/protocol'

/** Rooms nobody has touched for this long are deleted. */
const ROOM_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface ConnectionState {
  role: 'host' | 'viewer'
}

type GameConnection = Connection<ConnectionState>

const randomCode = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

const toHex = (bytes: ArrayBuffer | Uint8Array): string => {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

const sha256 = async (value: string): Promise<string> => {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
}

/**
 * One game. Holds the host token hash and the latest state, and fans updates
 * out to every viewer. Routed at /parties/game-room/<CODE>.
 */
export class GameRoom extends Server<Env> {
  static options = { hibernate: true }

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    // Keep-alives are answered by the runtime without waking the object.
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG))
  }

  /** Claim a fresh room. False if the code is already in use. */
  async claim(tokenHash: string): Promise<boolean> {
    if (await this.ctx.storage.get('tokenHash')) return false
    await this.ctx.storage.put('tokenHash', tokenHash)
    await this.touch()
    return true
  }

  async exists(): Promise<boolean> {
    return (await this.ctx.storage.get('tokenHash')) !== undefined
  }

  async onConnect(connection: GameConnection): Promise<void> {
    if (!(await this.exists())) {
      connection.close(4404, 'No such game')
      return
    }
    // Everyone joins as a viewer; the host upgrades by sending its token.
    connection.setState({ role: 'viewer' })
    const state = await this.ctx.storage.get<SharedState>('state')
    if (state) this.send(connection, { type: 'state', state })
    this.broadcastPresence()
  }

  async onMessage(connection: GameConnection, raw: string | ArrayBuffer): Promise<void> {
    if (typeof raw !== 'string' || raw.length > MAX_MESSAGE_BYTES) {
      this.send(connection, { type: 'error', code: 'invalid' })
      return
    }

    let message: ClientMessage
    try {
      message = JSON.parse(raw) as ClientMessage
    } catch {
      this.send(connection, { type: 'error', code: 'invalid' })
      return
    }

    if (message.type === 'auth') {
      const stored = await this.ctx.storage.get<string>('tokenHash')
      const presented = await sha256(String(message.token))
      const encoder = new TextEncoder()
      const ok =
        stored !== undefined &&
        stored.length === presented.length &&
        crypto.subtle.timingSafeEqual(encoder.encode(stored), encoder.encode(presented))
      if (!ok) {
        this.send(connection, { type: 'error', code: 'bad-token' })
        return
      }
      connection.setState({ role: 'host' })
      this.send(connection, { type: 'role', role: 'host' })
      this.broadcastPresence()
      return
    }

    if (connection.state?.role !== 'host') {
      this.send(connection, { type: 'error', code: 'not-host' })
      return
    }

    if (message.type === 'state') {
      if (!isSharedState(message.state)) {
        this.send(connection, { type: 'error', code: 'invalid' })
        return
      }
      await this.ctx.storage.put('state', message.state)
      await this.touch()
      this.broadcast(JSON.stringify({ type: 'state', state: message.state }), [connection.id])
      return
    }

    if (message.type === 'end') {
      this.broadcast(JSON.stringify({ type: 'ended' } satisfies ServerMessage))
      await this.destroy()
    }
  }

  onClose(): void {
    this.broadcastPresence()
  }

  async onAlarm(): Promise<void> {
    const lastActive = (await this.ctx.storage.get<number>('lastActive')) ?? 0
    if (Date.now() - lastActive >= ROOM_TTL_MS) {
      this.broadcast(JSON.stringify({ type: 'ended' } satisfies ServerMessage))
      await this.destroy()
    } else {
      await this.ctx.storage.setAlarm(lastActive + ROOM_TTL_MS)
    }
  }

  private async touch(): Promise<void> {
    const now = Date.now()
    await this.ctx.storage.put('lastActive', now)
    await this.ctx.storage.setAlarm(now + ROOM_TTL_MS)
  }

  private async destroy(): Promise<void> {
    for (const connection of this.getConnections()) {
      connection.close(1000, 'Game ended')
    }
    await this.ctx.storage.deleteAlarm()
    await this.ctx.storage.deleteAll()
  }

  private send(connection: Connection, message: ServerMessage): void {
    connection.send(JSON.stringify(message))
  }

  private broadcastPresence(): void {
    let viewers = 0
    for (const connection of this.getConnections<ConnectionState>()) {
      if (connection.state?.role === 'viewer') viewers++
    }
    this.broadcast(JSON.stringify({ type: 'presence', viewers } satisfies ServerMessage))
  }
}

const allowedOrigin = (request: Request, env: Env): string | null => {
  const origin = request.headers.get('Origin')
  if (!origin) return null
  return env.ALLOWED_ORIGINS.split(',')
    .map((o) => o.trim())
    .includes(origin)
    ? origin
    : null
}

const withCors = (response: Response, origin: string): Response => {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Vary', 'Origin')
  return new Response(response.body, { status: response.status, headers })
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    const origin = allowedOrigin(request, env)
    // Only the app's own origins may use the service. Not a security boundary
    // (Origin can be forged outside a browser) but it stops casual hotlinking.
    if (!origin) return new Response('Forbidden', { status: 403 })

    if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }), origin)

    // Create a game: returns its code and the host's secret token.
    if (request.method === 'POST' && url.pathname === '/rooms') {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
      const { success } = await env.CREATE_LIMITER.limit({ key: ip })
      if (!success) return withCors(new Response('Too many games', { status: 429 }), origin)

      for (let attempt = 0; attempt < 8; attempt++) {
        const code = randomCode()
        const hostToken = toHex(crypto.getRandomValues(new Uint8Array(32)))
        const room = await getServerByName(env.GameRoom, code)
        if (await room.claim(await sha256(hostToken))) {
          const body: CreateRoomResponse = { code, hostToken }
          return withCors(Response.json(body, { status: 201 }), origin)
        }
      }
      return withCors(new Response('No free codes, try again', { status: 503 }), origin)
    }

    // Does a game exist? Lets the app say "no such game" before connecting.
    const lookup = url.pathname.match(/^\/rooms\/([A-Z]+)$/)
    if (request.method === 'GET' && lookup) {
      const found =
        CODE_PATTERN.test(lookup[1]) &&
        (await (await getServerByName(env.GameRoom, lookup[1])).exists())
      return withCors(new Response(null, { status: found ? 204 : 404 }), origin)
    }

    const routed = await routePartykitRequest(request, env, {
      onBeforeConnect: (_request, { name }) =>
        CODE_PATTERN.test(name) ? undefined : new Response('Not found', { status: 404 }),
    })
    return routed ?? withCors(new Response('Not found', { status: 404 }), origin)
  },
} satisfies ExportedHandler<Env>
