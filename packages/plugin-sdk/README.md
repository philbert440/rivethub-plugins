# @rivethub/plugin-sdk

Write RivetHub plug-ins in TypeScript or JavaScript. `serve` answers what rh asks on the plug-in socket, `connect` calls
rh on the plug-in API socket, and `rivethub-plugin-dev` runs a plug-in without rh. The package is private to this
repository (a workspace, not on npm) and ships its TypeScript sources: a bundler such as esbuild builds them into a
plug-in, and Node 22.18 or later runs them as they are, as the `javascript` template and `plugins/workflows` do.

```ts
import { connect, Refusal, serve } from '@rivethub/plugin-sdk'

const rh = connect()

await serve({
  views: { main: () => ({ title: 'Checklist', blocks: [] }) },
  actions: {
    add: ({ values }) => {
      if (!values?.title) throw new Refusal('Give the item a title', { title: 'Required' })
      return [{ type: 'refresh' }]
    },
  },
  tools: { add_item: ({ title }) => `Added ${String(title)}` },
  events: { 'session.placed': () => rh.viewsChanged(['main']) },
  http: { export: () => new Response('id,title\n', { headers: { 'content-type': 'text/csv' } }) },
  settings: (values) => console.log('settings', values),
})
```

## Exports

| Export | What it is |
| --- | --- |
| `serve(plugin, env?)` | Listens on `RIVETHUB_PLUGIN_SOCKET` and answers rh with the `Plugin`'s handlers. Resolves to the Node `Server` once it listens. |
| `Plugin` | The handler tables `serve` takes (below). Every key is optional. |
| `Refusal` | `new Refusal(message, fields?)`: thrown from an action, it answers `422 {message, fields}` and the form shows each field's message beside it. |
| `connect(env?)` | A `RivetHub` client for `RIVETHUB_API_SOCKET` with `RIVETHUB_PLUGIN_TOKEN`. |
| `RivetHub` | The client class; `new RivetHub(socket, token)` builds one by hand. |
| `RivetHubError` | What a client call rejects with when rh answers outside 2xx: `status`, and `code` and `detail` from rh's `GatewayError`; `message` is its `error`, then `: detail` when there is one. |
| `pluginEnv(env?)` | `PluginEnv` `{id, node, dataDir, socket, apiSocket, token}` from the `RIVETHUB_*` variables; throws naming the first one missing. |
| `router(plugin)` | The routing `serve` uses, as `(method, path, text) => Promise<Reply>` (`Reply` is `{status, body?}`), for tests without a socket. It does not serve `http`. |
| `EventHandlers`, `EventKind`, `EventOf<K>` | The `events` table's type, the subscribable kinds (every `PluginEvent` type but `settings.changed`) and one kind's event. |
| Contract types | `Accepted` and `Sent` (every `@rivethub/contract` type), and by name: `PluginManifest`, `View`, `ViewBlock`, `ViewInline`, `ViewButton`, `ViewField`, `ViewAction`, `ViewValue`, `CanvasScene`, `CanvasItem`, `CanvasShape`, `CanvasOp`, `CanvasResponse`, `PluginToolResult`, `PluginJobResult`, `PluginNotify` (what a plug-in answers or sends) and `ViewRequest`, `ViewActionRequest`, `CanvasEventRequest`, `CanvasEvent`, `PluginToolCall`, `PluginEventDelivery`, `PluginEvent`, `PluginJobRequest`, `PluginSelf`, `GatewayError`, `Settings` (what it receives). |

## The `Plugin` handlers

| Key | Handler | rh calls | Answer |
| --- | --- | --- | --- |
| `views` | `(request: ViewRequest) => View` | `POST /views/{view}` | the view |
| `actions` | `(request: ViewActionRequest) => ViewAction[]` | `POST /actions/{action}` | `{actions}`; a thrown `Refusal` is `422`, any other error `500` |
| `canvas` | `(request: CanvasEventRequest) => CanvasResponse` | `POST /canvas/{canvas}/events` | `{ops?, actions?}` |
| `tools` | `(args, call: PluginToolCall) => string \| PluginToolResult` | `POST /tools/{tool}` | a string becomes `{text}`; a thrown error becomes `{text: message, isError: true}` |
| `events` | `(event: EventOf<K>, delivery: PluginEventDelivery) => void`, keyed by kind | `POST /events` | `204` |
| `jobs` | `(request: PluginJobRequest) => string \| undefined` | `POST /jobs/{job}` | `{outcome: 'succeeded', message?}`; a thrown error is `{outcome: 'failed', message}` |
| `http` | `(request: Request) => Response` | any method on `/http/{name}/…` | the `Response`, streamed |
| `settings` | `(values: Settings) => void` | at start and on `settings.changed` | |

Every handler may be async. A view, canvas or event handler that throws answers `500` with the message; rh logs it, and
retries an event. A name the table lacks is the plug-in's own `404`, a request body that is not JSON is `400`, and
`GET /health` answers `200 ok`.

Events: `serve` remembers the last `seq` it handled and answers a repeated delivery `204` without calling the handler. A
delivery whose handler throws is not counted, so rh's retry runs it again. `settings.changed` never reaches `events`: it
goes to `settings`, which `serve` also calls once before it listens, with `PluginSelf.settings` from
`GET /api/plugin/self`. Without a `settings` handler that call is skipped.

`http`: a request whose path starts `/http/{name}` goes to `http[name]` as a web `Request` with rh's headers (among them
`x-rivethub-user`, `x-rivethub-node` and `x-rivethub-request-id`), the query, and the body unread, so a handler can
stream an upload. Clients reach it as `/api/plugins/{id}/http/{name}/…`, and rh waits 60 s for the first byte. A handler
that throws answers `500` with the message as text. rh passes the status, headers (less hop-by-hop headers and
`Set-Cookie`) and body through, adding `Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups
allow-downloads` and `X-Content-Type-Options: nosniff`. The SDK serves no `/panel/` route, so a `webPanel` block cannot
be answered with it yet.

## Calling rh

`connect()` reads the environment rh starts the plug-in with; the token changes at every start and only works on the
API socket.

| Method | Route | Needs |
| --- | --- | --- |
| `self(): Promise<PluginSelf>` | `GET /api/plugin/self`: id, node, version, granted permissions, settings (secrets included) and `dataDir` | nothing |
| `viewsChanged(views: string[])` | `POST /api/plugin/views/changed`: every client showing one of those views fetches it again | nothing |
| `notify(notice: PluginNotify)` | `POST /api/plugin/notify` `{title, text?, tone?, action?}`: a notification in every app | `notifications.send` |
| `request<T>(method, path, body?)` | any route a granted permission opens, as the node's owner, with its usual body; resolves to the parsed JSON, or `undefined` for an empty answer | the route's permission |

A route outside the granted permissions rejects with a `RivetHubError` of status `403` and code `permission_required`,
naming the missing permission in `detail` (none for a route no permission opens); a missing or stale token is `401`.

## `rivethub-plugin-dev`

`rivethub-plugin-dev [dir]` (default `.`) reads `dir/rivethub-plugin.json`, starts `run.command` in `dir` with the
environment rh gives it (`PATH`, `HOME`, `USER`, `LANG`, `LC_ALL`, `TZ`, `run.env`, the `RIVETHUB_*` variables and
`TMPDIR`), waits up to `run.readyTimeoutMs` (default 10000) for `GET /health`, then reads one command per line from
stdin and prints the plug-in's status and answer:

```
view <view> [{"params":{},"context":{}}]
action <action> [{"values":{},"params":{}}]
canvas <canvas> {"event":{"type":"activated","item":"<id>"}}
tool <tool> [arguments]
event <kind> [fields]
job <job>
```

`event` wraps the fields as a delivery with the next `seq` (so `event settings.changed {"values":{"on":true}}` reaches
the settings handler), and `job` sends a `manual` run. The harness stands in for rh's API socket: `GET /api/plugin/self`
answers node `dev`, every permission the manifest asks for, and each setting's manifest `value`; `POST
/api/plugin/views/changed` and `/notify` are printed as `rh ← …` and answered `204`; any other route answers `501` with
code `not_in_dev_harness`. It has no command for `http` routes, applies no Landlock confinement, and deletes its
temporary data folder when stdin closes or the plug-in exits. A workspace in this repository has it on `PATH` in npm
scripts (`npm run dev` in `templates/typescript`); elsewhere run `node <this package>/src/dev.ts <dir>`.
