# rivethub-plugin

Write RivetHub plug-ins in Rust. `Plugin` answers what rh asks on the plug-in socket and `RivetHub` calls rh on the
plug-in API socket. The crate is not published (`publish = false`); the Rust template depends on it by path:
`rivethub-plugin = { path = "../../rust/rivethub-plugin" }`. It needs a Tokio runtime (the template uses
`#[tokio::main]` with `rt-multi-thread` and `macros`).

```rust
use rivethub_plugin::contract::{View, ViewAction, ViewActionRefusal, ViewValue};
use rivethub_plugin::{Env, Error, Plugin};

#[tokio::main]
async fn main() -> Result<(), Error> {
    let env = Env::from_env()?;
    Plugin::new(env.rivethub())
        .view("main", |_, _| async move {
            Ok(View { title: "Checklist".into(), ..View::default() })
        })
        .action("add", |_, request| async move {
            match request.values.get("title") {
                Some(ViewValue::Text(title)) if !title.trim().is_empty() => Ok(vec![ViewAction::Refresh]),
                _ => Err(ViewActionRefusal::new("Give the item a title").field("title", "Required").into()),
            }
        })
        .tool("add_item", |rh, call| async move {
            let title: String = call.parse::<serde_json::Value>()?["title"].as_str().unwrap_or_default().into();
            rh.views_changed(["main"]).await?;
            Ok(format!("Added {title}"))
        })
        .serve()
        .await
}
```

## `Plugin<S>`

`Plugin::new(state)` keeps `state` in an `Arc<S>` (`S: Send + Sync + 'static`) and hands it to every handler. Each
builder method registers an async handler `Fn(Arc<S>, Input) -> impl Future<Output = Result<Output, Error>>`:

| Method | Input | Output | rh calls |
| --- | --- | --- | --- |
| `.view(name, handler)` | `ViewRequest` | `View` | `POST /views/{name}` |
| `.action(name, handler)` | `ViewActionRequest` | `Vec<ViewAction>` | `POST /actions/{name}` |
| `.canvas(name, handler)` | `CanvasEventRequest` | `CanvasResponse` | `POST /canvas/{name}/events` |
| `.tool(name, handler)` | `PluginToolCall` | `String` | `POST /tools/{name}` |
| `.job(name, handler)` | `PluginJobRequest` | `Option<String>` | `POST /jobs/{name}` |
| `.events(handler)` | `PluginEventDelivery` | `()` | `POST /events`, every kind |
| `.settings(handler)` | `BTreeMap<String, ViewValue>` | `()` | at start and on `settings.changed` |

`.serve().await` reads the environment with `Env::from_env`, calls the settings handler once with
`PluginSelf.settings` when there is one, binds `RIVETHUB_PLUGIN_SOCKET` and answers until the process ends.
`plugin.handle(&method, path, body).await` answers one request without a socket and returns a `Reply` `{status, json,
body}`, for tests.

What an `Err` becomes: from an action, `Error::Refused(refusal)` answers `422 {message, fields}` and anything else
`500`; from a tool, `{text: <the error>, isError: true}`; from a job, `{outcome: "failed", message}`; from a view,
canvas, event or settings handler, `500` with the message. `GET /health` answers `200 ok`, an unregistered name `404`,
and a body that does not parse as its input `400`.

Events: one handler takes every kind, so match on `delivery.event` (`PluginEvent::SessionPlaced { .. }` and the rest). A
repeated `seq` is answered `204` without calling it, and a delivery whose handler fails is not counted, so rh's retry
runs it again. `settings.changed` goes to the settings handler when there is one, else to the events handler.

The crate serves no `http/` or `panel/` routes; the TypeScript SDK serves `http/`.

## Calling rh

`Env::from_env()` reads `RIVETHUB_PLUGIN_ID`, `RIVETHUB_PLUGIN_NODE`, `RIVETHUB_PLUGIN_DATA`, `RIVETHUB_PLUGIN_SOCKET`,
`RIVETHUB_API_SOCKET` and `RIVETHUB_PLUGIN_TOKEN` into `Env` `{id, node, data_dir, socket, api_socket, token}`, or
fails with `Error::Missing(name)`. `env.rivethub()` (or `RivetHub::new(socket, token)`) gives the client:

| Method | Route |
| --- | --- |
| `own() -> PluginSelf` | `GET /api/plugin/self`: id, node, version, granted permissions, settings (secrets included), data folder |
| `views_changed(views)` | `POST /api/plugin/views/changed`: every client showing one of those views fetches it again |
| `notify(&PluginNotify)` | `POST /api/plugin/notify` (`notifications.send`) |
| `get::<T>(path)`, `post::<B, T>(path, &body)`, `request::<B, T>(method, path, Option<&B>)` | any route a granted permission opens, as the node's owner |

An answer outside 2xx is `Error::RivetHub { status, error }` with rh's `GatewayError` (`error`, `detail`, `code`, …); a
route outside the granted permissions is `403` with code `permission_required`. An empty answer is read as JSON `null`,
so ask for `()`, an `Option` or `serde_json::Value` from a route that answers nothing.

## Errors and helpers

`Error` is `Refused(ViewActionRefusal)`, `Failed(String)` (`Error::failed(message)`), `Missing(&'static str)`,
`RivetHub { status, error }`, `Io`, `Json` and `Http`, with `From` for `ViewActionRefusal`, `std::io::Error`,
`serde_json::Error` and `hyper::Error`, so `?` works on each. `ViewActionRefusal::new(message).field(key, message)`
builds a refusal, and `call.parse::<A>()` reads a tool call's arguments as any `Deserialize` type. The crate also
re-exports `Method` and `StatusCode` from hyper.

`rivethub_plugin::contract` holds the plug-in types generated from the runtime's accepted schema by `npm run contract`
(the manifest, views, canvas, events, jobs, tools, the plug-in API bodies and `GatewayError`). Never write them by
hand.

Run a built plug-in without rh with the TypeScript SDK's harness: `cargo build --release`, then
`rivethub-plugin-dev <plug-in folder>` (see `packages/plugin-sdk`).
