import type {
  CanvasEventRequest,
  CanvasResponse,
  PluginEvent,
  PluginEventDelivery,
  PluginJobRequest,
  PluginJobResult,
  PluginToolCall,
  PluginToolResult,
  Settings,
  View,
  ViewAction,
  ViewActionRequest,
  ViewRequest,
} from './types.ts'

type Awaitable<T> = T | Promise<T>

export type EventKind = Exclude<PluginEvent['type'], 'settings.changed'>
export type EventOf<K extends PluginEvent['type']> = Extract<PluginEvent, { type: K }>
export type EventHandlers = {
  [K in EventKind]?: (event: EventOf<K>, delivery: PluginEventDelivery) => Awaitable<void>
}

export interface Plugin {
  views?: Record<string, (request: ViewRequest) => Awaitable<View>>
  actions?: Record<string, (request: ViewActionRequest) => Awaitable<ViewAction[]>>
  canvas?: Record<string, (request: CanvasEventRequest) => Awaitable<CanvasResponse>>
  tools?: Record<
    string,
    (args: PluginToolCall['arguments'], call: PluginToolCall) => Awaitable<string | PluginToolResult>
  >
  events?: EventHandlers
  jobs?: Record<string, (request: PluginJobRequest) => Awaitable<string | undefined>>
  http?: Record<string, (request: Request) => Awaitable<Response>>
  settings?: (values: Settings) => Awaitable<void>
}

export class Refusal extends Error {
  readonly fields: Record<string, string>

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message)
    this.fields = fields
  }
}

export type Reply = { status: number; body?: unknown }

const named = <T>(table: Record<string, T> | undefined, name: string | undefined): T | undefined =>
  table !== undefined && name !== undefined && Object.hasOwn(table, name) ? table[name] : undefined

const failure = (error: unknown): string => (error instanceof Error ? error.message : String(error))

const missing: Reply = { status: 404, body: 'not found' }

export function router(plugin: Plugin): (method: string, path: string, text: string) => Promise<Reply> {
  let seen = 0

  async function event(delivery: PluginEventDelivery): Promise<Reply> {
    if (delivery.seq <= seen) return { status: 204 }
    const { event } = delivery
    if (event.type === 'settings.changed') {
      await plugin.settings?.(event.values)
    } else {
      const handler = plugin.events?.[event.type] as
        | ((event: PluginEvent, delivery: PluginEventDelivery) => Awaitable<void>)
        | undefined
      await handler?.(event, delivery)
    }
    seen = delivery.seq
    return { status: 204 }
  }

  async function action(name: string | undefined, request: ViewActionRequest): Promise<Reply> {
    const handler = named(plugin.actions, name)
    if (handler === undefined) return missing
    try {
      return { status: 200, body: { actions: await handler(request) } }
    } catch (error) {
      if (error instanceof Refusal) return { status: 422, body: { message: error.message, fields: error.fields } }
      throw error
    }
  }

  async function tool(name: string | undefined, call: PluginToolCall): Promise<Reply> {
    const handler = named(plugin.tools, name)
    if (handler === undefined) return missing
    try {
      const result = await handler(call.arguments, call)
      return { status: 200, body: typeof result === 'string' ? { text: result } : result }
    } catch (error) {
      return { status: 200, body: { text: failure(error), isError: true } satisfies PluginToolResult }
    }
  }

  async function job(name: string | undefined, request: PluginJobRequest): Promise<Reply> {
    const handler = named(plugin.jobs, name)
    if (handler === undefined) return missing
    let result: PluginJobResult
    try {
      const message = await handler(request)
      result = message === undefined ? { outcome: 'succeeded' } : { outcome: 'succeeded', message }
    } catch (error) {
      result = { outcome: 'failed', message: failure(error) }
    }
    return { status: 200, body: result }
  }

  async function answer(segments: string[], body: unknown): Promise<Reply> {
    const [kind, name, tail] = segments
    if (kind === 'views' && segments.length === 2) {
      const handler = named(plugin.views, name)
      return handler === undefined ? missing : { status: 200, body: await handler(body as ViewRequest) }
    }
    if (kind === 'canvas' && tail === 'events' && segments.length === 3) {
      const handler = named(plugin.canvas, name)
      return handler === undefined ? missing : { status: 200, body: await handler(body as CanvasEventRequest) }
    }
    if (kind === 'actions' && segments.length === 2) return action(name, body as ViewActionRequest)
    if (kind === 'tools' && segments.length === 2) return tool(name, body as PluginToolCall)
    if (kind === 'jobs' && segments.length === 2) return job(name, body as PluginJobRequest)
    if (kind === 'events' && segments.length === 1) return event(body as PluginEventDelivery)
    return missing
  }

  return async (method, path, text) => {
    const segments = new URL(path, 'http://plugin').pathname.split('/').filter(Boolean)
    if (method === 'GET' && segments.length === 1 && segments[0] === 'health') return { status: 200, body: 'ok' }
    if (method !== 'POST') return missing
    let body: unknown
    try {
      body = JSON.parse(text)
    } catch (error) {
      return { status: 400, body: failure(error) }
    }
    try {
      return await answer(segments, body)
    } catch (error) {
      return { status: 500, body: failure(error) }
    }
  }
}
