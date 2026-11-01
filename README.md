# rivethub-plugins

Plug-ins for RivetHub, and the SDKs and templates for writing them. A plug-in is a program that runs in its own process
on one node and reaches the runtime only over its published contract: row B17 and notes 50 to 60, 71 and 91 of
`docs/CONTRACT.md` in [rivethub-runtime](https://github.com/philbert440/rivethub-runtime). rh starts it, proxies clients
to its views, delivers its events, runs its jobs and offers its tools to agents through `rh mcp`.

## Layout

- `packages/contract`: `@rivethub/contract`, the runtime's schemas and the types generated from them.
- `packages/plugin-sdk`: `@rivethub/plugin-sdk`, for plug-ins in TypeScript or JavaScript, with the
  `rivethub-plugin-dev` harness. Its [README](packages/plugin-sdk/README.md) documents the API.
- `rust/rivethub-plugin`: the `rivethub-plugin` crate, for plug-ins in Rust, in a Cargo workspace of its own. Its
  [README](rust/rivethub-plugin/README.md) documents the API.
- `templates/typescript`, `templates/rust`: a checklist plug-in in each language to start from: a page with a form and
  a list (and a canvas board in TypeScript), an `add_item` agent tool and a `session.placed` subscription.
- `templates/javascript`: the same checklist with its canvas board, in JavaScript that Node runs as it is, and
  [`GUIDE.md`](templates/javascript/GUIDE.md), the field-by-field guide an agent builds from. It is the template rh's
  plug-in creator scaffolds from.
- `plugins/voice`, `plugins/files`, `plugins/workflows`: the plug-ins described under [The plug-ins](#the-plug-ins).

## The contract

`contract.json` pins a runtime commit. `npm run contract` fetches that commit's `contract/sent.schema.json` and
`contract/accepted.schema.json`, vendors them under `packages/contract/schema/`, and generates:

- the `@rivethub/contract` types: `Sent`, what the runtime sends (responses, events), and `Accepted`, what it accepts
  (requests, and a plug-in's answers);
- `rust/rivethub-plugin/src/contract.rs`, the plug-in types (the manifest, views, canvas, events, jobs, tools, the
  plug-in API and `GatewayError`) as Rust, from the accepted schema.

To move to a newer runtime, set `ref` in `contract.json` to the runtime commit's full sha, run `npm run contract`, and
commit the schema and type diff in its own PR. If a plug-in needs something the contract doesn't offer, propose the
change to the runtime first.

## How a plug-in runs

A plug-in is a directory holding `rivethub-plugin.json`, its manifest, and the program its `run.command` starts. The
manifest names the plug-in (`id`: 2 to 24 of `a-z`, `0-9` and single hyphens), what it asks for (`permissions`), its
`settings` fields, its agent `tools`, its `contributes` (`pages`, `topicCards`, `sessionActions`), its `jobs` and the
`events` it subscribes to; `GUIDE.md` lists every field. rh refuses an unknown field or an invalid value, naming its
path.

rh starts `run.command` in the plug-in directory with `PATH`, `HOME`, `USER`, `LANG`, `LC_ALL` and `TZ` from its own
environment, `run.env`, and `RIVETHUB_PLUGIN_ID`, `RIVETHUB_PLUGIN_NODE`, `RIVETHUB_PLUGIN_DATA` (its data folder),
`RIVETHUB_PLUGIN_SOCKET`, `RIVETHUB_API_SOCKET`, `RIVETHUB_PLUGIN_TOKEN` and `TMPDIR`. The plug-in serves HTTP/1.1 on
the unix socket `RIVETHUB_PLUGIN_SOCKET`: `GET /health` (it is ready once this answers 2xx within `run.readyTimeoutMs`,
default 10000), `POST /views/{view}`, `/actions/{action}`, `/canvas/{canvas}/events`, `/tools/{tool}`, `/events` and
`/jobs/{job}`, `GET /panel/{path}` and any method on `/http/{path}`, as far as its manifest needs them. A process that
exits or is not ready in time is started again after 1 s, doubling to 60 s.

Clients reach it through rh as `/api/plugins/{id}/{views,actions,canvas,tools,panel,http}/…`; rh adds
`x-rivethub-user`, `x-rivethub-node` and `x-rivethub-request-id` and drops the caller's credentials. rh parses every
view, action, canvas and tool answer as its contract type and answers the client `502` `plugin_invalid_response`,
naming the field, for one that does not parse. It waits 30 s for those answers, 120 s for a tool and 60 s for the first
byte of a `panel` or `http` answer, which it streams. Agents get each tool as `<id>-<tool>` from `rh mcp`.

The plug-in calls rh on `RIVETHUB_API_SOCKET` with `Authorization: Bearer <RIVETHUB_PLUGIN_TOKEN>`, a token minted at
each start: `GET /api/plugin/self` (its record, settings and data folder), `POST /api/plugin/views/changed` (clients
showing those views fetch them again; apps never poll), `POST /api/plugin/notify`, and the routes its permissions open.

rh keeps each plug-in's `<state>/plugins/<id>/`: `data/` (kept across reloads and disables), `run/` (its socket and
`TMPDIR`) and `logs/plugin.log`, which holds its stdout and stderr and rh's own `host` lines (start, exit, every answer
it refused).

## Writing one

Both SDKs answer what rh asks on the plug-in socket, drop an event delivery they have already handled (by `seq`), pass
the starting settings and every `settings.changed` to a settings handler, and call rh on the API socket.

```ts
await serve({
  views: { main: () => ({ title: 'Checklist', blocks: [] }) },
  actions: { add: ({ values }) => [{ type: 'refresh' }] },
  tools: { add_item: ({ title }) => `Added ${String(title)}` },
  events: { 'session.placed': ({ sessionId }) => {} },
  http: { report: (request) => new Response('ok') },
})
```

```rust
Plugin::new(state)
    .view("main", |state, request| async move { Ok(view(&state)) })
    .tool("add_item", |state, call| async move { add(&state, call.parse()?) })
    .events(|state, delivery| async move { record(&state, delivery.event) })
    .serve()
    .await
```

Only the TypeScript SDK serves `http/` routes; neither serves `panel/` yet. On Linux rh confines the process with
Landlock (see [Permissions](#permissions)), so it can read only its own directory, the program it runs and the system
folders. A TypeScript plug-in therefore runs a bundle (`npm run build -w <workspace>` writes `dist/plugin.js` with
esbuild), a JavaScript one carries the SDK's sources in its own `sdk/` folder, and a Rust one runs its release binary
(`cargo build --release`, `run.command` `["target/release/<name>"]`).

`rivethub-plugin-dev <dir>` starts a plug-in the way rh does, standing in for its `/api/plugin` routes, and reads
commands from stdin (`view main`, `action add {"values":{"title":"x"}}`, `canvas board {"event":{…}}`, `tool add_item
{"title":"x"}`, `event session.placed {…}`, `job <job>`), printing each answer. Any other rh route answers `501`, and
`http` routes have no command. `npm run dev` in `templates/typescript` builds and runs it this way.

## Installing on a node

Only the node's owner manages plug-ins:

- `POST /api/plugins` `{"path": "<absolute directory>"}` registers the directory in place, disabled, with every
  permission it asks for pending. Nothing is copied, so edits to the directory take effect at the next reload.
- `POST /api/plugins/{id}/enable` `{"approve": [<the pending permissions>]}` (`{}` when none are pending) grants them
  and starts the process.
- `POST /api/plugins/{id}/reload` reads the manifest again and restarts an enabled plug-in. Fewer permissions narrow the
  grant at once; more stop it in `awaitingApproval` until an enable approves them.
- `POST …/disable` stops it and keeps its grants, settings and data; `DELETE /api/plugins/{id}` removes it and its
  `<state>/plugins/<id>/` (`?keepData=true` keeps that), never the source directory.
- `GET …/logs?tail=<n>` reads its log; `GET` and `PUT …/settings` `{"values": {…}}` read and change its settings (`null`
  resets a key to the manifest's `value`) and deliver `settings.changed`; `POST …/jobs/{job}/run` runs a job.

Every authenticated user of the node can list plug-ins and use their views, actions, canvases, panels and tools.

## Permissions

A plug-in asks for permissions in its manifest. Approving is the `enable` call: it must name exactly the pending
permissions (`409` `permissions_unapproved` otherwise), and an enable that grants one the plug-in does not hold yet must
come from a paired device's certificate mapped to the owner; a bearer token, a node or agent certificate or a loopback
caller gets `403` `device_certificate_required`. So an agent can install and reload a plug-in, and a person approves it
from the RivetHub app on a paired device.

| Permission | What it opens on the API socket (`GET` means `GET` or `HEAD`) |
| --- | --- |
| `memory.read` | `GET /api/memory/*`, `GET /api/wiki*`, `POST /api/memory/tool/{memory_search,memory_browse,memory_stats,memory_get_full}`; the `summary.written` event |
| `memory.write` | `POST /api/capture`, `POST /api/memory/tool/memory_append`, written as agent `plugin:<id>` |
| `sessions.read` | `GET /api/harness-sessions*`, `/api/harnesses/*`, `/api/catalog`; the `session.*` events |
| `sessions.control` | other methods on `/api/harness-sessions*`, `POST /api/sessions/{session}/messages` |
| `topics.read` | `GET /api/topics*`, `/api/sessions/history`, `/api/sessions/suggestions`, `/api/sessions/{session}/placement` |
| `topics.write` | other methods on `/api/topics*`, `/api/sessions/{session}/placement` and `/api/sessions/{session}/history` |
| `tasks.read` | `GET /api/tasks*`; the `task.done` event |
| `tasks.delegate` | `POST /api/tasks` |
| `agents.read` | `GET /api/agents*` |
| `notifications.send` | `POST /api/plugin/notify` |

Any other route answers `403` `permission_required`. On Linux the process is confined with Landlock: it reads its
install directory, the program it runs (and the `lib` folder beside that program's `bin` folder), `/usr`, `/bin`,
`/sbin`, `/lib*`, `/etc`, `/proc`, `/sys` and the `/dev` null, zero and random devices; writes only its `data/` and
`run/` folders and `/dev/null`; connects only to the API socket; and opens no TCP connection. The host permissions widen
that: `host.files.read` and `host.files.write` read and write any file the node's user can, `host.network` allows TCP
except to rh's own ports, and `host.exec` records that it runs other programs, which inherit its confinement. A node
whose kernel lacks full Landlock refuses to enable a plug-in that asks for a `host.*` permission (`409`
`sandbox_unavailable`).

## Web panels

A view can hold a `webPanel` block `{id, entry, height?, params?}` for what blocks and canvases cannot draw. The client
loads `GET /panel/{entry}` in a web view at an origin of its own for each plug-in and node, serving `/http/…` from the
plug-in's `http/` route and every other path from `panel/` through the proxy with its own credentials, so the page holds
no token and reaches only its plug-in. Scripts run only from files on those routes, never inline; the page cannot
navigate away, open pop-ups or download.

The page talks to the client with `parent.postMessage(message, '*')` and receives the client's messages as `message`
events, telling them apart by `type`:

- the client sends `{type: 'init', theme, params?, context, plugin, node}` once the page has loaded and
  `{type: 'theme', theme}` when the theme changes, `theme` being `{scheme, colors, fontFamily, fontMono, fontSize,
  radius}`, and sets the same as CSS variables: `--rh-color-<role>` with the colour role in kebab case
  (`--rh-color-surface-container-high`), `--rh-font-family`, `--rh-font-mono`, `--rh-font-size`, `--rh-radius` and
  `color-scheme`;
- the page sends `{type: 'ready'}`, `{type: 'resize', height}` and `{type: 'action', action}`, which runs any view
  action as a button would.

`PanelMessage` and `PanelHostMessage` in `@rivethub/contract` (under `Accepted` and `Sent`) type them. RivetHub desktop
drops a message over 256 KiB or one that does not parse, and keeps `resize` heights between 48 and 2400. A panel has
no permissions of its own: it can do what its plug-in's routes do. Neither SDK serves `panel/` yet.

## Creator mode

rh's plug-in creator (note 71) lets an agent build a plug-in on its own node with four tools that `rh mcp` lists under
the reserved id `plugins`:

- `plugins-templates` `{}` lists the node's templates, or says that a person has to install them;
- `plugins-scaffold` `{template, id, name, description}` copies a template into a new `<state>/workshop/<id>/`, sets
  the manifest's `id`, `name` and `description`, and answers the folder;
- `plugins-install` `{id}` checks that folder's manifest, installs or reloads it, waits for it to start and asks each
  page for its view, reporting every answer rh refuses;
- `plugins-status` `{id?, lines?}` answers its state, permissions, last exit and last log lines (40 by default, at most
  200), or without an id the node's plug-ins.

The tools never enable a plug-in or grant a permission; their answers tell the agent when a person has to act. rh
carries no templates and fetches none: it reads `<state>/plugin-templates/`, one real folder per template. `npm run
templates:install` copies `templates/javascript` there with an `sdk/` folder holding the SDK's sources (`index.ts`,
`plugin.ts`, `rivethub.ts`, `serve.ts`, `types.ts`), which Node 22.18 and later runs without a build. `<state>` is the
first argument (`npm run templates:install -- <folder>`), else `RIVETHUB_STATE_DIR`, else `~/.rivethub`. Run it again
after pulling a newer SDK; it replaces the template, and plug-ins already scaffolded keep the SDK they were made with.

## The plug-ins

Build the TypeScript ones with `npm ci` and `npm run build -w plugins/<name>`, then install the directory as above.

### Voice

`plugins/voice`: speech to text and text to speech for the composer, through OpenAI-compatible servers. It asks for
`host.network` and has three settings: `sttUrl`, a transcription endpoint that takes a multipart `file` and answers
`{text}`; `ttsUrl`, a speech endpoint that takes `{input, response_format, instructions?, voice?}`; and `instructions`,
sent with each speech request that brings none. Both URLs must be `http` or `https` with a host.

- `POST /api/plugins/voice/http/transcribe`: the body is the audio, at most 15 MiB (its content type is passed on when
  it is one the plug-in knows, else `audio/wav`); answers `{text}`.
- `POST /api/plugins/voice/http/speak`: the body is `{input, instructions?, voice?}`, at most 64 KiB, `input` at most
  4096 UTF-8 bytes; answers the audio, asked for as `wav`, streamed, at most 30 MiB.

Errors are `{error}`: `400` for a bad body, `413` for audio over the limit, `501` when the URL is unset or invalid,
and `502` when the server fails or answers something else. Through rh's proxy a server has 60 s to start answering.
These are the bodies, limits and errors of rh's deprecated `/api/voice/transcribe` and `/api/voice/speak`.

### Files

`plugins/files`: the Files page's and the workflow editor's file calls, under one folder. It asks for
`host.files.read` and `host.files.write`; its one setting, `root`, is that absolute folder. Paths are relative to it,
and a path with `..`, a leading `/` or `~`, or a backslash, or a link that leads outside it, is `403`.

| Route under `/api/plugins/files/http/` | Query | Answer |
| --- | --- | --- |
| `GET list` | `path` | `{path, root, entries: [{name, type, size, mtime}]}`, `type` `dir` or `file`, folders first |
| `GET download` | `path` | the file, at most 1 GiB: common image, text, JSON, CSV, PDF, audio and video types inline, the rest as an attachment |
| `POST upload` | `dir`, `name`, `overwrite=1` | the body is the file, at most 1 GiB; answers `{ok: true, path}` |
| `POST mkdir` | `dir`, `name` | `{ok: true, path}` |
| `POST rename` | `from`, `to` | `{ok: true, path}` |
| `DELETE delete` | `path`, `recursive=1` | `{ok: true, path}` |

An upload is written to a hidden part file that `list` never shows and moved into place whole; it refuses to replace a
file without `overwrite=1`, and through rh's proxy it must finish within 60 s, since the answer comes once the file is
written. Errors are `{error}`: `403`, `404`, `405` for the wrong method, `409` for a name that exists or a folder that
is not empty, `413`, `422` for a bad name or a missing argument, and `503` when `root` is unset ("files browser disabled
on this node") or missing. These are the queries, bodies and errors of rh's deprecated `/api/files/*`.

### Workflows

`plugins/workflows`: define an ordered list of agent steps and run them, each step getting the previous step's result.
It is JavaScript that Node runs as it is (`node plugin.js`, no build), with its own copy of the SDK's sources in `sdk/`,
taken before the SDK gained `http` routes. It asks for `tasks.delegate` and `tasks.read`, has no settings, and adds a
Workflows page (views `main`, `editor`, `history` and `run`).

A workflow is a name and steps, each an agent name and a prompt. A run delegates each step in order with
`POST /api/tasks` (the prompt, plus the previous result marked as data; a 10-minute budget; `delegate_task` excluded),
waits on `GET /api/tasks/{id}/wait`, and stops at the first step that does not complete. Workflows, runs and each
step's status and result are kept in `workflows.db` (`node:sqlite`) in its data folder, a workflow runs once at a
time, and runs left unfinished resume when the plug-in starts.

## Rules

- Talk to the runtime only over its HTTP and WebSocket API and the plug-in sockets. Never read its database or files.
- Types come from `@rivethub/contract` and the generated `contract` module. Never hand-write a DTO.
- No code comments: names and types carry the meaning.
- Conventional Commits, authored by people, with no AI attribution trailers or text.

## Checks

`npm run check` runs what CI runs: Biome lint and format, `tsc` in strict mode, the tests, the contract freshness check
(which fetches the pinned schemas), the privacy scan, and `npm run rust` (rustfmt and Clippy with warnings as errors
for the crate and the Rust template, and the crate's tests). Run it before every push. On a pull request CI also scans
its title and body for private data and checks every commit's author and message.
