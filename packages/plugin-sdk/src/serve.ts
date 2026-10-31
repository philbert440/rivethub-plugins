import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'
import { type Plugin, type Reply, router } from './plugin.ts'
import { connect, pluginEnv } from './rivethub.ts'

type HttpHandler = NonNullable<Plugin['http']>[string]

function write(response: ServerResponse, reply: Reply): void {
  if (reply.body === undefined) {
    response.writeHead(reply.status).end()
  } else if (typeof reply.body === 'string') {
    response.writeHead(reply.status, { 'content-type': 'text/plain; charset=utf-8' }).end(reply.body)
  } else {
    response.writeHead(reply.status, { 'content-type': 'application/json' }).end(JSON.stringify(reply.body))
  }
}

function httpHandler(plugin: Plugin, url: string): HttpHandler | undefined {
  const [kind, name] = new URL(url, 'http://plugin').pathname.split('/').filter(Boolean)
  if (kind !== 'http' || name === undefined || plugin.http === undefined) return undefined
  return Object.hasOwn(plugin.http, name) ? plugin.http[name] : undefined
}

function webRequest(incoming: IncomingMessage): Request {
  const headers = new Headers()
  const raw = incoming.rawHeaders
  for (let index = 0; index + 1 < raw.length; index += 2) headers.append(raw[index] ?? '', raw[index + 1] ?? '')
  const method = incoming.method ?? 'GET'
  const body = method === 'GET' || method === 'HEAD' ? null : (Readable.toWeb(incoming) as ReadableStream<Uint8Array>)
  return new Request(new URL(incoming.url ?? '/', 'http://plugin'), { method, headers, body, duplex: 'half' })
}

async function relay(handler: HttpHandler, incoming: IncomingMessage, response: ServerResponse): Promise<void> {
  let answer: Response
  try {
    answer = await handler(webRequest(incoming))
  } catch (error) {
    answer = new Response(error instanceof Error ? error.message : String(error), {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }
  const headers = Object.fromEntries(answer.headers)
  if (!incoming.complete) headers.connection = 'close'
  response.writeHead(answer.status, headers)
  if (answer.body === null) {
    response.end()
    return
  }
  await pipeline(Readable.fromWeb(answer.body as NodeReadableStream<Uint8Array>), response).catch((error: unknown) =>
    response.destroy(error instanceof Error ? error : undefined),
  )
}

export async function serve(plugin: Plugin, env: NodeJS.ProcessEnv = process.env): Promise<Server> {
  const { socket } = pluginEnv(env)
  if (plugin.settings !== undefined) await plugin.settings((await connect(env).self()).settings)
  const route = router(plugin)
  const server = createServer(async (request, response) => {
    const handler = httpHandler(plugin, request.url ?? '/')
    if (handler !== undefined) return relay(handler, request, response)
    const chunks: Buffer[] = []
    for await (const chunk of request) chunks.push(chunk as Buffer)
    write(response, await route(request.method ?? 'GET', request.url ?? '/', Buffer.concat(chunks).toString('utf8')))
  })
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(socket, resolve)
  })
  return server
}
