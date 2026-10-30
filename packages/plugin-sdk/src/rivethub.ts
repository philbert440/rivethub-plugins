import { request as send } from 'node:http'
import type { Accepted, GatewayError, PluginNotify, PluginSelf } from './types.ts'

export type PluginEnv = {
  id: string
  node: string
  dataDir: string
  socket: string
  apiSocket: string
  token: string
}

export function pluginEnv(env: NodeJS.ProcessEnv = process.env): PluginEnv {
  const read = (name: string): string => {
    const value = env[name]
    if (value === undefined || value === '') {
      throw new Error(`${name} is not set: run the plug-in from rh or rivethub-plugin-dev`)
    }
    return value
  }
  return {
    id: read('RIVETHUB_PLUGIN_ID'),
    node: read('RIVETHUB_PLUGIN_NODE'),
    dataDir: read('RIVETHUB_PLUGIN_DATA'),
    socket: read('RIVETHUB_PLUGIN_SOCKET'),
    apiSocket: read('RIVETHUB_API_SOCKET'),
    token: read('RIVETHUB_PLUGIN_TOKEN'),
  }
}

export class RivetHubError extends Error {
  readonly status: number
  readonly code: string | undefined
  readonly detail: string | undefined

  constructor(status: number, body: GatewayError) {
    super(body.detail ? `${body.error}: ${body.detail}` : body.error)
    this.status = status
    this.code = body.code ?? undefined
    this.detail = body.detail ?? undefined
  }
}

function gatewayError(status: number, text: string): GatewayError {
  try {
    const body = JSON.parse(text) as Partial<GatewayError>
    if (typeof body.error === 'string') return body as GatewayError
  } catch {}
  return { error: text || `rh answered ${status}` }
}

export class RivetHub {
  readonly #socket: string
  readonly #token: string

  constructor(socket: string, token: string) {
    this.#socket = socket
    this.#token = token
  }

  self(): Promise<PluginSelf> {
    return this.request('GET', '/api/plugin/self')
  }

  async viewsChanged(views: string[]): Promise<void> {
    await this.request('POST', '/api/plugin/views/changed', { views } satisfies Accepted.PluginViewsChanged)
  }

  async notify(notice: PluginNotify): Promise<void> {
    await this.request('POST', '/api/plugin/notify', notice)
  }

  request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const payload = body === undefined ? undefined : JSON.stringify(body)
    const headers: Record<string, string> = { authorization: `Bearer ${this.#token}` }
    if (payload !== undefined) headers['content-type'] = 'application/json'
    return new Promise((resolve, reject) => {
      const outgoing = send({ socketPath: this.#socket, path, method, headers }, (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => chunks.push(chunk))
        response.on('error', reject)
        response.on('end', () => {
          const status = response.statusCode ?? 0
          const text = Buffer.concat(chunks).toString('utf8')
          if (status < 200 || status > 299) reject(new RivetHubError(status, gatewayError(status, text)))
          else resolve((text === '' ? undefined : JSON.parse(text)) as T)
        })
      })
      outgoing.on('error', reject)
      outgoing.end(payload)
    })
  }
}

export function connect(env: NodeJS.ProcessEnv = process.env): RivetHub {
  const { apiSocket, token } = pluginEnv(env)
  return new RivetHub(apiSocket, token)
}
