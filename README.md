# rivethub-plugins

Plug-ins for RivetHub, and the SDKs and templates for writing them. A plug-in is a program that runs in its own process on
one node and reaches the runtime only over its published contract (row B17 and notes 50 to 60 of the
[rivethub-runtime](https://github.com/philbert440/rivethub-runtime) CONTRACT): rh starts it, proxies clients to its
views, delivers its events and offers its tools to agents through `rh mcp`. A plug-in that proves valuable for everyone
gets promoted into the platform, with its domain moving into a runtime context and its payloads into the contract.

## Layout

- `packages/contract`: `@rivethub/contract`, the runtime's schemas and the types generated from them.
- `packages/plugin-sdk`: `@rivethub/plugin-sdk`, for plug-ins in TypeScript, with the `rivethub-plugin-dev` harness.
- `rust/rivethub-plugin`: the `rivethub-plugin` crate, for plug-ins in Rust, in a Cargo workspace of its own.
- `templates/typescript`, `templates/rust`: a checklist plug-in in each language to start from: a page with a form and
  a list (and a canvas board in TypeScript), an `add_item` agent tool and a `session.placed` subscription.
- `templates/javascript`: the same checklist with its canvas board, in JavaScript that Node runs as it is, and a
  `GUIDE.md` for an agent building from it. It is the template rh's plug-in creator scaffolds from.
- `plugins/voice`: speech to text and text to speech for the composer, on `http/transcribe` and `http/speak`, through
  the STT and TTS servers named in its settings. It replaces rh's `/api/voice` routes.
- `plugins/files`: the Files page's and the workflow editor's file calls on `http/list`, `http/download`, `http/upload`,
  `http/mkdir`, `http/rename` and `http/delete`, with the queries, bodies and errors of rh's `/api/files` routes, which it
  replaces. Every path stays inside the folder its `root` setting names, links included.

## The contract

`contract.json` pins a runtime commit. `npm run contract` fetches that commit's `contract/sent.schema.json` and
`contract/accepted.schema.json`, vendors them under `packages/contract/schema/`, and generates:

- the `@rivethub/contract` types: `Sent`, what the runtime sends (responses, events), and `Accepted`, what it accepts
  (requests, and a plug-in's answers);
- `rust/rivethub-plugin/src/contract.rs`, the plug-in types (the manifest, views, canvas, events, jobs, tools, the
  plug-in API and `GatewayError`) as Rust, from the accepted schema.

To move to a newer runtime, set `ref` in `contract.json` to a commit on the runtime's `main`, run `npm run contract`, and
commit the schema and type diff in its own PR. If a plug-in needs something the contract doesn't offer, propose the
change to the runtime first.

## Writing a plug-in

A plug-in is a directory holding `rivethub-plugin.json` and the program its `run.command` starts. Both SDKs answer what rh
asks on the plug-in socket (`GET /health`, views, actions, canvas events, tools, events and jobs), drop an event
delivery they have already handled (by `seq`), pass `settings.changed` and the starting settings to the settings
handler, and call rh on the plug-in API socket with the per-start token: the plug-in's own record, `viewsChanged`,
`notify`, and any route its permissions name.

```ts
await serve({
  views: { main: () => ({ title: 'Checklist', blocks: [] }) },
  actions: { add: ({ values }) => [{ type: 'refresh' }] },
  tools: { add_item: ({ title }) => `Added ${String(title)}` },
  events: { 'session.placed': ({ sessionId }) => {} },
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

The TypeScript SDK also serves the `http/` routes: `http: { speak: (request) => response }` gets each
`/http/speak/…` call as a web `Request`, body unread, and streams the `Response` it returns back through rh.

On Linux rh confines a plug-in with Landlock to its own directory, its data and run folders and the program it runs, so
a TypeScript plug-in runs a bundle (`npm run build` writes `dist/plugin.js` with esbuild) rather than sources that
import from outside its directory, and a Rust plug-in runs its release binary.

`rivethub-plugin-dev <dir>` starts a plug-in the way rh does, standing in for its own `/api/plugin` routes, and reads
commands from stdin (`view main`, `action add {"values":{"title":"x"}}`, `tool add_item {"title":"x"}`,
`event session.placed {...}`, `job <id>`), printing each answer. To run one on a node, `POST /api/plugins` with
`{"path": "<absolute directory>"}` and enable it from a paired device.

## Templates on a node

rh's plug-in creator (note 70 of the runtime's CONTRACT) lets an agent on a node scaffold a plug-in from a template,
edit it, install it and read its log through `rh mcp`. rh carries no templates; it reads them from the node's
`<state>/plugin-templates/` (`~/.rivethub/plugin-templates/` unless the state folder moved), one folder each, and never
fetches one. `npm run templates:install` writes the templates that need no build there: the `javascript` folder with
`sdk/`, the SDK's own TypeScript sources, which Node 22.18 and later runs without a build. Pass another state folder as
`npm run templates:install -- <folder>`. Run it again after pulling a newer SDK; plug-ins already scaffolded keep the
SDK they were made with.

## Rules

- Talk to the runtime only over its HTTP and WebSocket API and the plug-in sockets. Never read its database or files.
- Types come from `@rivethub/contract` and the generated `contract` module. Never hand-write a DTO.
- No code comments: names and types carry the meaning.
- Conventional Commits, authored by people, with no AI attribution trailers or text.

## Checks

`npm run check` runs what CI runs: Biome lint and format, `tsc` in strict mode, the tests, the contract freshness check,
the privacy scan, and `npm run rust` (rustfmt, Clippy with warnings as errors, and the tests, for the crate and the Rust
template). Run it before every push.
