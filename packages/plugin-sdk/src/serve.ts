import { createServer, type Server, type ServerResponse } from 'node:http'
import { type Plugin, type Reply, router } from './plugin.ts'
import { connect, pluginEnv } from './rivethub.ts'

function write(response: ServerResponse, reply: Reply): void {
  if (reply.body === undefined) {
    response.writeHead(reply.status).end()
  } else if (typeof reply.body === 'string') {
    response.writeHead(reply.status, { 'content-type': 'text/plain; charset=utf-8' }).end(reply.body)
  } else {
    response.writeHead(reply.status, { 'content-type': 'application/json' }).end(JSON.stringify(reply.body))
  }
}

export async function serve(plugin: Plugin, env: NodeJS.ProcessEnv = process.env): Promise<Server> {
  const { socket } = pluginEnv(env)
  if (plugin.settings !== undefined) await plugin.settings((await connect(env).self()).settings)
  const route = router(plugin)
  const server = createServer(async (request, response) => {
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
