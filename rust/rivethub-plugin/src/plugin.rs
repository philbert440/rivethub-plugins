use std::collections::{BTreeMap, HashMap};
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};

use http_body_util::{BodyExt, Full};
use hyper::body::{Bytes, Incoming};
use hyper::header::CONTENT_TYPE;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Method, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use serde::Serialize;
use serde::de::DeserializeOwned;
use tokio::net::UnixListener;

use crate::contract::{
    CanvasEventRequest, CanvasResponse, PluginEvent, PluginEventDelivery, PluginJobOutcome,
    PluginJobRequest, PluginJobResult, PluginToolCall, PluginToolResult, View, ViewAction,
    ViewActionRefusal, ViewActionRequest, ViewActionResult, ViewRequest, ViewValue,
};
use crate::{Env, Error};

type Answer<T> = Pin<Box<dyn Future<Output = Result<T, Error>> + Send>>;
type Handler<S, A, T> = Box<dyn Fn(Arc<S>, A) -> Answer<T> + Send + Sync>;
type Routes<S, A, T> = HashMap<String, Handler<S, A, T>>;

fn boxed<S, A, T, F, Fut>(handler: F) -> Handler<S, A, T>
where
    F: Fn(Arc<S>, A) -> Fut + Send + Sync + 'static,
    Fut: Future<Output = Result<T, Error>> + Send + 'static,
{
    Box::new(move |state, input| Box::pin(handler(state, input)))
}

pub struct Plugin<S> {
    state: Arc<S>,
    views: Routes<S, ViewRequest, View>,
    actions: Routes<S, ViewActionRequest, Vec<ViewAction>>,
    canvases: Routes<S, CanvasEventRequest, CanvasResponse>,
    tools: Routes<S, PluginToolCall, String>,
    jobs: Routes<S, PluginJobRequest, Option<String>>,
    events: Option<Handler<S, PluginEventDelivery, ()>>,
    settings: Option<Handler<S, BTreeMap<String, ViewValue>, ()>>,
    seen: AtomicU64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Reply {
    pub status: StatusCode,
    pub json: bool,
    pub body: Vec<u8>,
}

impl Reply {
    fn json<T: Serialize>(status: StatusCode, value: &T) -> Self {
        match serde_json::to_vec(value) {
            Ok(body) => Self {
                status,
                json: true,
                body,
            },
            Err(error) => Self::text(StatusCode::INTERNAL_SERVER_ERROR, &error.to_string()),
        }
    }

    fn text(status: StatusCode, text: &str) -> Self {
        Self {
            status,
            json: false,
            body: text.as_bytes().to_vec(),
        }
    }

    fn empty() -> Self {
        Self {
            status: StatusCode::NO_CONTENT,
            json: false,
            body: Vec::new(),
        }
    }

    fn missing() -> Self {
        Self::text(StatusCode::NOT_FOUND, "not found")
    }

    fn failed(error: &Error) -> Self {
        Self::text(StatusCode::INTERNAL_SERVER_ERROR, &error.to_string())
    }

    fn into_response(self) -> Response<Full<Bytes>> {
        let kind = if self.json {
            "application/json"
        } else {
            "text/plain; charset=utf-8"
        };
        let mut response = Response::new(Full::new(Bytes::from(self.body)));
        *response.status_mut() = self.status;
        if let Ok(value) = kind.parse() {
            response.headers_mut().insert(CONTENT_TYPE, value);
        }
        response
    }
}

impl PluginToolCall {
    pub fn parse<A: DeserializeOwned>(&self) -> Result<A, Error> {
        Ok(serde_json::from_value(serde_json::Value::Object(
            self.arguments.clone(),
        ))?)
    }
}

impl ViewActionRefusal {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            fields: BTreeMap::new(),
        }
    }

    #[must_use]
    pub fn field(mut self, key: impl Into<String>, message: impl Into<String>) -> Self {
        self.fields.insert(key.into(), message.into());
        self
    }
}

impl<S: Send + Sync + 'static> Plugin<S> {
    pub fn new(state: S) -> Self {
        Self {
            state: Arc::new(state),
            views: HashMap::new(),
            actions: HashMap::new(),
            canvases: HashMap::new(),
            tools: HashMap::new(),
            jobs: HashMap::new(),
            events: None,
            settings: None,
            seen: AtomicU64::new(0),
        }
    }

    #[must_use]
    pub fn view<F, Fut>(mut self, name: &str, handler: F) -> Self
    where
        F: Fn(Arc<S>, ViewRequest) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<View, Error>> + Send + 'static,
    {
        self.views.insert(name.to_owned(), boxed(handler));
        self
    }

    #[must_use]
    pub fn action<F, Fut>(mut self, name: &str, handler: F) -> Self
    where
        F: Fn(Arc<S>, ViewActionRequest) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<Vec<ViewAction>, Error>> + Send + 'static,
    {
        self.actions.insert(name.to_owned(), boxed(handler));
        self
    }

    #[must_use]
    pub fn canvas<F, Fut>(mut self, name: &str, handler: F) -> Self
    where
        F: Fn(Arc<S>, CanvasEventRequest) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<CanvasResponse, Error>> + Send + 'static,
    {
        self.canvases.insert(name.to_owned(), boxed(handler));
        self
    }

    #[must_use]
    pub fn tool<F, Fut>(mut self, name: &str, handler: F) -> Self
    where
        F: Fn(Arc<S>, PluginToolCall) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<String, Error>> + Send + 'static,
    {
        self.tools.insert(name.to_owned(), boxed(handler));
        self
    }

    #[must_use]
    pub fn job<F, Fut>(mut self, name: &str, handler: F) -> Self
    where
        F: Fn(Arc<S>, PluginJobRequest) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<Option<String>, Error>> + Send + 'static,
    {
        self.jobs.insert(name.to_owned(), boxed(handler));
        self
    }

    #[must_use]
    pub fn events<F, Fut>(mut self, handler: F) -> Self
    where
        F: Fn(Arc<S>, PluginEventDelivery) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<(), Error>> + Send + 'static,
    {
        self.events = Some(boxed(handler));
        self
    }

    #[must_use]
    pub fn settings<F, Fut>(mut self, handler: F) -> Self
    where
        F: Fn(Arc<S>, BTreeMap<String, ViewValue>) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<(), Error>> + Send + 'static,
    {
        self.settings = Some(boxed(handler));
        self
    }

    pub async fn serve(self) -> Result<(), Error> {
        let env = Env::from_env()?;
        if let Some(settings) = &self.settings {
            let own = env.rivethub().own().await?;
            settings(Arc::clone(&self.state), own.settings).await?;
        }
        let listener = UnixListener::bind(&env.socket)?;
        let plugin = Arc::new(self);
        loop {
            let (stream, _) = listener.accept().await?;
            let plugin = Arc::clone(&plugin);
            tokio::spawn(async move {
                let service = service_fn(move |request| {
                    let plugin = Arc::clone(&plugin);
                    async move { plugin.respond(request).await }
                });
                if let Err(error) = http1::Builder::new()
                    .serve_connection(TokioIo::new(stream), service)
                    .await
                {
                    eprintln!("rivethub-plugin: {error}");
                }
            });
        }
    }

    async fn respond(&self, request: Request<Incoming>) -> Result<Response<Full<Bytes>>, Error> {
        let (parts, body) = request.into_parts();
        let body = body.collect().await?.to_bytes();
        Ok(self
            .handle(&parts.method, parts.uri.path(), &body)
            .await
            .into_response())
    }

    pub async fn handle(&self, method: &Method, path: &str, body: &[u8]) -> Reply {
        let segments: Vec<&str> = path.split('/').filter(|part| !part.is_empty()).collect();
        if method == Method::GET && segments == ["health"] {
            return Reply::text(StatusCode::OK, "ok");
        }
        if method != Method::POST {
            return Reply::missing();
        }
        match segments.as_slice() {
            ["views", name] => match self.call(self.views.get(*name), body).await {
                Ok(Ok(view)) => Reply::json(StatusCode::OK, &view),
                Ok(Err(error)) => Reply::failed(&error),
                Err(reply) => reply,
            },
            ["actions", name] => match self.call(self.actions.get(*name), body).await {
                Ok(Ok(actions)) => Reply::json(StatusCode::OK, &ViewActionResult { actions }),
                Ok(Err(Error::Refused(refusal))) => {
                    Reply::json(StatusCode::UNPROCESSABLE_ENTITY, &refusal)
                }
                Ok(Err(error)) => Reply::failed(&error),
                Err(reply) => reply,
            },
            ["canvas", name, "events"] => match self.call(self.canvases.get(*name), body).await {
                Ok(Ok(answer)) => Reply::json(StatusCode::OK, &answer),
                Ok(Err(error)) => Reply::failed(&error),
                Err(reply) => reply,
            },
            ["tools", name] => match self.call(self.tools.get(*name), body).await {
                Ok(outcome) => {
                    let is_error = outcome.is_err();
                    let text = outcome.unwrap_or_else(|error| error.to_string());
                    Reply::json(StatusCode::OK, &PluginToolResult { text, is_error })
                }
                Err(reply) => reply,
            },
            ["jobs", name] => match self.call(self.jobs.get(*name), body).await {
                Ok(outcome) => {
                    let result = match outcome {
                        Ok(message) => PluginJobResult {
                            outcome: PluginJobOutcome::Succeeded,
                            message,
                        },
                        Err(error) => PluginJobResult {
                            outcome: PluginJobOutcome::Failed,
                            message: Some(error.to_string()),
                        },
                    };
                    Reply::json(StatusCode::OK, &result)
                }
                Err(reply) => reply,
            },
            ["events"] => self.event(body).await,
            _ => Reply::missing(),
        }
    }

    async fn call<A, T>(
        &self,
        handler: Option<&Handler<S, A, T>>,
        body: &[u8],
    ) -> Result<Result<T, Error>, Reply>
    where
        A: DeserializeOwned,
    {
        let handler = handler.ok_or_else(Reply::missing)?;
        let input = serde_json::from_slice(body)
            .map_err(|error| Reply::text(StatusCode::BAD_REQUEST, &error.to_string()))?;
        Ok(handler(Arc::clone(&self.state), input).await)
    }

    async fn event(&self, body: &[u8]) -> Reply {
        let delivery: PluginEventDelivery = match serde_json::from_slice(body) {
            Ok(delivery) => delivery,
            Err(error) => return Reply::text(StatusCode::BAD_REQUEST, &error.to_string()),
        };
        let seq = delivery.seq;
        if seq <= self.seen.load(Ordering::Acquire) {
            return Reply::empty();
        }
        let handled = match (delivery.event, &self.settings) {
            (PluginEvent::SettingsChanged { values }, Some(settings)) => {
                settings(Arc::clone(&self.state), values).await
            }
            (event, _) => match &self.events {
                Some(events) => {
                    let delivery = PluginEventDelivery { event, ..delivery };
                    events(Arc::clone(&self.state), delivery).await
                }
                None => Ok(()),
            },
        };
        match handled {
            Ok(()) => {
                self.seen.store(seq, Ordering::Release);
                Reply::empty()
            }
            Err(error) => Reply::failed(&error),
        }
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Mutex;

    use serde_json::{Value, json};

    use super::*;

    async fn post(plugin: &Plugin<Mutex<Vec<String>>>, path: &str, body: &Value) -> Reply {
        plugin
            .handle(&Method::POST, path, body.to_string().as_bytes())
            .await
    }

    fn parsed(reply: &Reply) -> Value {
        serde_json::from_slice(&reply.body).unwrap_or(Value::Null)
    }

    #[tokio::test]
    async fn an_action_refusal_answers_422_naming_its_fields() {
        let plugin = Plugin::new(Mutex::new(Vec::new())).action("add", |_, request| async move {
            if request.values.contains_key("title") {
                Ok(vec![ViewAction::Refresh])
            } else {
                Err(ViewActionRefusal::new("Give it a title")
                    .field("title", "Required")
                    .into())
            }
        });
        let refused = post(&plugin, "/actions/add", &json!({"context": {}})).await;
        assert_eq!(refused.status, StatusCode::UNPROCESSABLE_ENTITY);
        assert_eq!(
            parsed(&refused),
            json!({"message": "Give it a title", "fields": {"title": "Required"}})
        );
        let accepted = post(&plugin, "/actions/add", &json!({"values": {"title": "x"}})).await;
        assert_eq!(parsed(&accepted), json!({"actions": [{"type": "refresh"}]}));
    }

    #[tokio::test]
    async fn a_failing_tool_answers_its_message_as_an_error_result() {
        let plugin = Plugin::new(Mutex::new(Vec::new())).tool("add_item", |_, call| async move {
            let title: String = call.parse::<Value>()?["title"]
                .as_str()
                .ok_or_else(|| Error::failed("title must be a string"))?
                .to_owned();
            Ok(format!("added {title}"))
        });
        let added = post(
            &plugin,
            "/tools/add_item",
            &json!({"arguments": {"title": "x"}}),
        )
        .await;
        assert_eq!(parsed(&added), json!({"text": "added x"}));
        let failed = post(&plugin, "/tools/add_item", &json!({"arguments": {}})).await;
        assert_eq!(
            parsed(&failed),
            json!({"text": "title must be a string", "isError": true})
        );
    }

    #[tokio::test]
    async fn a_repeated_delivery_is_handled_once_and_a_failed_one_is_retried() {
        let plugin = Plugin::new(Mutex::new(Vec::new()))
            .events(|seen, delivery| async move {
                if let PluginEvent::SessionIdle { session_id } = delivery.event {
                    let mut seen = seen
                        .lock()
                        .unwrap_or_else(std::sync::PoisonError::into_inner);
                    if session_id == "b" && !seen.contains(&"failed".to_owned()) {
                        seen.push("failed".to_owned());
                        return Err(Error::failed("not yet"));
                    }
                    seen.push(session_id);
                }
                Ok(())
            })
            .settings(|seen, values| async move {
                let text = serde_json::to_string(&values)?;
                seen.lock()
                    .unwrap_or_else(std::sync::PoisonError::into_inner)
                    .push(text);
                Ok(())
            });
        let deliver =
            |seq: u64, event: Value| json!({"seq": seq, "at": 0, "missed": 0, "event": event});
        let idle = |session: &str| json!({"type": "session.idle", "sessionId": session});
        let settings = json!({"type": "settings.changed", "values": {"on": true}});
        let statuses = [
            post(&plugin, "/events", &deliver(1, idle("a")))
                .await
                .status,
            post(&plugin, "/events", &deliver(1, idle("a")))
                .await
                .status,
            post(&plugin, "/events", &deliver(2, settings)).await.status,
            post(&plugin, "/events", &deliver(3, idle("b")))
                .await
                .status,
            post(&plugin, "/events", &deliver(3, idle("b")))
                .await
                .status,
        ];
        assert_eq!(
            statuses.map(|status| status.as_u16()),
            [204, 204, 204, 500, 204]
        );
        let seen = plugin
            .state
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner)
            .clone();
        assert_eq!(seen, ["a", r#"{"on":true}"#, "failed", "b"]);
    }
}
