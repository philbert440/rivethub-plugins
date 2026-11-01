# Building this plug-in

This folder is a RivetHub plug-in: a small program rh starts on this node, reaches over a unix socket and draws in
the RivetHub apps with their own widgets. It starts as a working example (a checklist page with a form, a list and a
canvas board, an `add_item` agent tool and a `session.placed` subscription). Rewrite it into what the person asked for.

## The loop

1. Edit the files here: `rivethub-plugin.json` (the manifest), `plugin.js` (the program) and any modules you add.
2. Call `plugins-install` with this plug-in's id. It checks the manifest (an invalid one changes nothing and the answer
   names the field), installs the folder or reloads it, waits for the process to start and asks each page for its view
   the way the apps do. Read the whole answer: it says whether the plug-in runs, why not, and what to do next.
3. Call `plugins-status` to read its state and its last log lines: your `console.log` and `console.error` output, a
   crash's stack trace, and rh's own lines, marked `host` (start, exit status, and every answer rh refused or that
   failed, with the field it refused).
4. Fix what the answer or the log names and go back to 2. Repeat until it runs and its pages answer valid views.

You can install and reload. You cannot turn a plug-in on or grant it permissions: a person does that in the RivetHub
app (Settings › Plug-ins › the plug-in › Turn on, or Approve and turn on when it asks for permissions), from a device
paired with this node. A new plug-in stays off until they do. Once it is on, every reload restarts it with your changes,
unless the manifest asks for a permission it does not hold yet: then it stops until the person approves the new ones.
Dropping a permission from the manifest takes effect at the next reload. When an answer says a person has to act, tell
them exactly that.

## Files

- `sdk/` is `@rivethub/plugin-sdk`, as TypeScript sources that Node runs directly. Import from `./sdk/index.ts`, read
  `sdk/plugin.ts` and `sdk/rivethub.ts` for its API, and do not edit it.
- `plugin.js` calls `serve({ views, actions, canvas, tools, events, jobs, http, settings })`; every key is optional.
- Keep state in `pluginEnv().dataDir` (a folder rh keeps across reloads), as `checklist.js` does with one JSON file.
- The process runs as `node plugin.js` (Node 22.18 or later) with this folder as its working directory. Use Node's
  built-in modules. Anything else must live inside this folder: on Linux rh lets the process read only this folder, the
  program it runs and the system folders (`/usr`, `/etc`, `/proc` and the like), and write only its data folder and
  `TMPDIR`. It cannot write to this folder.

## The manifest

`manifest` 1; `id` (2 to 24 of `a-z`, `0-9` and single hyphens, starting with a letter, never `plugins`; it must stay
the folder's name); `name`; `version`; `description`; `icon` (a Material Symbols name, as every icon here);
`run.command` (`["node", "plugin.js"]`), `run.env` (no `RIVETHUB_` names) and `run.readyTimeoutMs` (default 10000);
`permissions`; `settings` (fields as in a form, any input but `file`, drawn in Settings, read with `rh.self()` and the
`settings` handler); `tools` (`{name, title?, description, inputSchema, hints?}`, offered to agents as `<id>-<name>`;
`name` uses `a-z`, `0-9` and single underscores); `contributes.pages` (`{id, title, icon?, view}`: a sidebar entry
opening that view), `contributes.topicCards` (`{id, title, view}`: a card in a topic, its view gets `context.topicId`)
and `contributes.sessionActions` (`{id, title, icon?, action}`: a session menu entry, `context.sessionId`); `jobs`
(`{id, title, schedule?, timeoutMs?}`, `schedule` a five-field cron in the node's time, `timeoutMs` default 600000);
`events` (`session.started`, `session.idle`, `session.ended`, `session.placed` need `sessions.read`; `summary.written`
needs `memory.read`; `task.done` needs `tasks.read`). Unknown fields are refused. Remove what you do not use, the
example's `sessions.read` and `session.placed` among them, so the person is not asked to approve it.

## Views

A view handler gets `{params, context}` and returns `{title, subtitle?, toolbar?, blocks}`. rh checks every answer:
an unknown field, a missing one or a wrong type is refused and logged, and the app shows an error instead of the view.

Blocks (`type`): `section` `{title?, subtitle?, actions?, blocks, collapsed?}`; `split` `{primary, secondary,
ratio?}`; `tabs` `{tabs: [{id, title, badge?, blocks}], selected?}`; `text` `{text, tone?, monospace?}`; `markdown`
`{text}`; `code` `{text, language?, follow?}`; `properties` `{items: [{label, value: inline}]}`; `progress` `{value?
(0 to 1), label?}`; `notice` `{tone, title?, text, actions?}`; `list` `{items: [{id, title, subtitle?, icon?, trailing?:
[inline], action?, menu?: [button]}], empty?}`; `table` `{columns: [{title, align?, sortable?}], rows: [{id, cells:
[inline], action?, menu?}], empty?}`; `breadcrumbs` `{items: [{label, action?}]}`; `actions` `{buttons}`; `form` `{id,
fields, buttons}`; `canvas` (below); `image` `{path, alt}`. `empty` is `{title, text?, button?}`. `image` and the
`download` action take a path under this plug-in's `http/` route (below): `chart/today.png` is `GET
/http/chart/today.png`, answered by the `chart` handler. Do not use `webPanel`: it needs a `panel/` route this SDK does
not serve.

Inlines (`type`): `text` `{text, tone?, icon?, monospace?}`, `badge` `{text, tone}`, `time` `{at: epoch ms, style?:
relative|absolute}`, `duration` `{ms}`, `bytes` `{value}`. Tones: `neutral`, `info`, `success`, `warning`, `danger`.

A button is `{label, icon?, style?: primary|secondary|danger, action, confirm?: {title, text, confirmLabel?},
disabled?}`. A field is `{key, label, input, value?, required?, help?, placeholder?}`, `input` one of `{type: 'text',
multiline?}`, `{type: 'secret'}`, `{type: 'number', min?, max?, step?}`, `{type: 'toggle'}` and `{type: 'select',
options: [{value, label}], multiple?}`.

Actions (`type`): `call` `{action, params?}` runs your action handler with `{params, values, context}` (`values` are
the form's when the button is in a form) and shows the actions it returns; throw `new Refusal(message, {field:
message})` to show errors beside fields. `navigate` `{view, params?, replace?}`, `dialog` `{view, params?}`, `back`,
`refresh`, `toast` `{text, tone?}`, `copy` `{text}`, `openSession` `{sessionId}`, `openTopic` `{topicId}`, `openUrl`
`{url}` (`http` or `https`), `download` `{path, filename?}`. An action handler cannot answer with another `call`. rh
waits 30 s for a view, action or canvas answer.

Apps never poll. A page shows what its view answered when it was opened; when your state changes on its own (a timer,
an event, an agent's tool call), call `await rh.viewsChanged(['main'])` (with `const rh = connect()`) and every app
showing that view fetches it again. A `time` inline with `style: 'relative'` or a `progress` block is drawn as of the
last fetch.

## Canvas

`{type: 'canvas', id, scene: {items, grid?: {size, snap}, viewport?}, height?, readOnly?, menu?}`, at most 5000 items.
An item is a `node` `{id, x, y, width, height, shapes, anchors?, tooltip?, menu?, locked?, decorative?}` or a
`connector` `{id, from: {node, anchor?}, to, route?: straight|curved|orthogonal, dashed?, arrow?: none|end|start|both,
label?}`. Shapes, relative to their node: `rect` `{x, y, width, height, radius?, fill?, stroke?, strokeWidth?}`,
`ellipse`, `text` `{x, y, text, size?, weight?: regular|medium|bold, color?, align?, maxWidth?, monospace?}`, `path` `{d,
fill?, stroke?}` and `icon` `{x, y, name, size?, color?}`. Colours are theme roles, never literal values: `surface`,
`surfaceContainer`, `surfaceContainerHigh`, `primary`, `primaryContainer`, `onPrimary`, `onPrimaryContainer`,
`secondaryContainer`, `onSurface`, `onSurfaceVariant`, `outline`, `outlineVariant`, the tones and `category1` to
`category6`. The app pans, zooms, selects and drags itself and sends your `canvas.<id>` handler `{event, params,
context}`, `event.type` one of `selected`, `moved` `{items: [{id, x, y}]}`, `connected`, `deleted` `{items}`,
`activated` `{item}` and `menu`. Answer `{ops?: [{type: 'upsert', item} | {type: 'remove', ids}], actions?}`.

## Tools, events, jobs, http and settings

`tools.<name>(arguments, call)` returns text (or `{text, isError}`) within 120 s; a thrown error becomes an error
result. `events` handlers get `(event, delivery)`, at least once and in order; the SDK drops a repeated `delivery.seq`,
and `delivery.missed` counts events lost before this one, so reconcile through the API when it is above 0. A handler
that throws is retried. `jobs.<id>(request)` returns an optional message; a thrown error fails the run. A `schedule`
runs a job at each tick, and the node's owner can run one at any time (`request.trigger` is `schedule` or `manual`).
`http.<name>(request)` gets every request to `/http/<name>/…` as a web `Request` (any method, the query, the body
unread) and returns a `Response`, which rh streams to the app; apps reach it as `/api/plugins/<id>/http/<name>/…`
and rh waits 60 s for its first byte. `settings(values)` gets the starting values and every change.

## Permissions

Ask only for what the plug-in uses; each is shown to the person when they approve. `rh.request(method, path, body)`
reaches the routes a permission opens, as the node's owner, with their usual bodies (`GET` here means `GET` or `HEAD`,
anything else a write): `memory.read` (`GET /api/memory/*` and `/api/wiki*`; `POST
/api/memory/tool/memory_search`, `memory_browse`, `memory_stats` and `memory_get_full`), `memory.write` (`POST
/api/capture`, `POST /api/memory/tool/memory_append`; what it writes is filed as agent `plugin:<id>`),
`sessions.read` (`GET /api/harness-sessions*`, `/api/harnesses/*` and `/api/catalog`), `sessions.control` (writes to
`/api/harness-sessions*` and `POST /api/sessions/<session>/messages`), `topics.read` (`GET /api/topics*`,
`/api/sessions/history`, `/api/sessions/suggestions` and `/api/sessions/<session>/placement`), `topics.write` (writes
to `/api/topics*`, `/api/sessions/<session>/placement` and `/api/sessions/<session>/history`), `tasks.read` (`GET
/api/tasks*`), `tasks.delegate` (`POST /api/tasks`), `agents.read` (`GET /api/agents*`) and `notifications.send`
(`rh.notify({title, text?, tone?, action?})`, a notification in every app). Any other route answers 403 with code
`permission_required`. Without a host permission the process opens no TCP connection and reads and writes only what
the Files list above names. `host.network` allows TCP (but not rh's own ports), `host.files.read` reads and
`host.files.write` writes any file the node's user can, and `host.exec` tells the person it runs other programs (they
run under the same confinement). Each needs the person's approval like the rest, and a node whose kernel cannot fully
confine the process refuses to turn on a plug-in that asks for one.
