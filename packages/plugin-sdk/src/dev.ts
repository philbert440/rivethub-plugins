#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createServer, request, type ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import type { GatewayError, PluginEventDelivery, PluginManifest, PluginSelf } from './types.ts'

const USAGE = `rivethub-plugin-dev [dir]: starts the plug-in in dir like rh does, then reads commands from stdin:
  view <view> [{"params":{},"context":{}}]
  action <action> [{"values":{},"params":{}}]
  canvas <canvas> {"event":{"type":"activated","item":"<id>"}}
  tool <tool> [arguments]
  event <kind> [fields]
  job <job>`

const dir = resolve(process.argv[2] ?? '.')
const manifest = JSON.parse(readFileSync(join(dir, 'rivethub-plugin.json'), 'utf8')) as PluginManifest
const root = mkdtempSync(join(tmpdir(), 'rhp-'))
const data = join(root, 'data')
const run = join(root, 'run')
const socket = join(run, 'plugin.sock')
const api = join(root, 'api.sock')
const token = randomBytes(32).toString('hex')
mkdirSync(data)
mkdirSync(run, { mode: 0o700 })

const own: PluginSelf = {
  id: manifest.id,
  node: 'dev',
  version: manifest.version,
  permissions: manifest.permissions ?? [],
  settings: Object.fromEntries(
    (manifest.settings ?? []).flatMap((field) =>
      field.value === undefined || field.value === null ? [] : [[field.key, field.value]],
    ),
  ),
  dataDir: data,
}

function reply(response: ServerResponse, status: number, body?: unknown): void {
  response.writeHead(status, body === undefined ? {} : { 'content-type': 'application/json' })
  response.end(body === undefined ? undefined : JSON.stringify(body))
}

const stand = createServer(async (incoming, response) => {
  const chunks: Buffer[] = []
  for await (const chunk of incoming) chunks.push(chunk as Buffer)
  const text = Buffer.concat(chunks).toString('utf8')
  if (incoming.headers.authorization !== `Bearer ${token}`) return reply(response, 401, { error: 'unauthorized' })
  if (incoming.method === 'GET' && incoming.url === '/api/plugin/self') return reply(response, 200, own)
  if (incoming.method === 'POST' && incoming.url?.startsWith('/api/plugin/')) {
    console.log(`rh ← ${incoming.url.slice('/api/plugin/'.length)} ${text}`)
    return reply(response, 204)
  }
  const refused: GatewayError = {
    error: 'the dev harness answers only the /api/plugin routes; use a throwaway rh node for the rest',
    code: 'not_in_dev_harness',
  }
  return reply(response, 501, refused)
})
await new Promise<void>((done) => stand.listen(api, done))

const [program, ...args] = manifest.run.command
if (program === undefined) throw new Error('run.command is empty')
const inherited = ['PATH', 'HOME', 'USER', 'LANG', 'LC_ALL', 'TZ'].flatMap((name) => {
  const value = process.env[name]
  return value === undefined ? [] : [[name, value]]
})
const child = spawn(program.includes('/') ? resolve(dir, program) : program, args, {
  cwd: dir,
  stdio: ['ignore', 'inherit', 'inherit'],
  env: {
    ...Object.fromEntries(inherited),
    ...manifest.run.env,
    RIVETHUB_PLUGIN_ID: manifest.id,
    RIVETHUB_PLUGIN_NODE: 'dev',
    RIVETHUB_PLUGIN_DATA: data,
    RIVETHUB_PLUGIN_SOCKET: socket,
    RIVETHUB_API_SOCKET: api,
    RIVETHUB_PLUGIN_TOKEN: token,
    TMPDIR: run,
  },
})

function call(method: string, path: string, body?: unknown): Promise<{ status: number; text: string }> {
  return new Promise((done, fail) => {
    const headers = { 'content-type': 'application/json', 'x-rivethub-user': 'owner', 'x-rivethub-node': 'dev' }
    const outgoing = request({ socketPath: socket, method, path, headers }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => done({ status: response.statusCode ?? 0, text: Buffer.concat(chunks).toString('utf8') }))
    })
    outgoing.on('error', fail)
    outgoing.end(body === undefined ? undefined : JSON.stringify(body))
  })
}

function stop(code: number): never {
  child.removeAllListeners('exit')
  child.kill('SIGTERM')
  stand.close()
  rmSync(root, { recursive: true, force: true })
  process.exit(code)
}

child.on('exit', (code, signal) => {
  console.error(`the plug-in exited (${signal ?? code})`)
  stop(1)
})

const deadline = Date.now() + (manifest.run.readyTimeoutMs ?? 10_000)
for (;;) {
  const healthy = await call('GET', '/health').then(
    (answer) => answer.status >= 200 && answer.status < 300,
    () => false,
  )
  if (healthy) break
  if (Date.now() > deadline) {
    console.error(`the plug-in did not answer GET /health within ${manifest.run.readyTimeoutMs ?? 10_000} ms`)
    stop(1)
  }
  await new Promise((done) => setTimeout(done, 100))
}
console.log(`${manifest.id} is ready; its data folder is ${data}\n${USAGE}`)

let seq = 0
const routes: Record<string, (name: string, body: Record<string, unknown>) => [string, unknown]> = {
  view: (name, body) => [`/views/${name}`, { context: {}, ...body }],
  action: (name, body) => [`/actions/${name}`, { context: {}, ...body }],
  canvas: (name, body) => [`/canvas/${name}/events`, { context: {}, ...body }],
  tool: (name, body) => [`/tools/${name}`, { arguments: body }],
  job: (name) => [`/jobs/${name}`, { runId: `dev-${Date.now()}`, trigger: 'manual' }],
  event: (name, body) => {
    seq += 1
    const delivery = { seq, at: Date.now(), missed: 0, event: { type: name, ...body } }
    return ['/events', delivery as PluginEventDelivery]
  },
}

for await (const line of createInterface({ input: process.stdin })) {
  const match = /^(\w+)\s+(\S+)\s*(.*)$/.exec(line.trim())
  const route = match?.[1] === undefined ? undefined : routes[match[1]]
  if (match === null || route === undefined) {
    if (line.trim() !== '') console.log(USAGE)
    continue
  }
  try {
    const [path, body] = route(match[2] ?? '', match[3] ? (JSON.parse(match[3]) as Record<string, unknown>) : {})
    const answer = await call('POST', path, body)
    let shown = answer.text
    try {
      shown = JSON.stringify(JSON.parse(answer.text), null, 2)
    } catch {}
    console.log(`${answer.status} ${shown}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
  }
}
stop(0)
