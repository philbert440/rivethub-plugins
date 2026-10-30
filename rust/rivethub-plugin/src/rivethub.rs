use std::path::PathBuf;

use http_body_util::Full;
use hyper::body::Bytes;
use hyper::header::{AUTHORIZATION, CONTENT_TYPE, HOST};
use hyper::{Method, Request};
use serde::Serialize;
use serde::de::DeserializeOwned;

use crate::Error;
use crate::contract::{GatewayError, PluginNotify, PluginSelf, PluginViewsChanged};

#[derive(Debug, Clone)]
pub struct Env {
    pub id: String,
    pub node: String,
    pub data_dir: PathBuf,
    pub socket: PathBuf,
    pub api_socket: PathBuf,
    pub token: String,
}

impl Env {
    pub fn from_env() -> Result<Self, Error> {
        let read = |name: &'static str| {
            std::env::var(name)
                .ok()
                .filter(|value| !value.is_empty())
                .ok_or(Error::Missing(name))
        };
        Ok(Self {
            id: read("RIVETHUB_PLUGIN_ID")?,
            node: read("RIVETHUB_PLUGIN_NODE")?,
            data_dir: read("RIVETHUB_PLUGIN_DATA")?.into(),
            socket: read("RIVETHUB_PLUGIN_SOCKET")?.into(),
            api_socket: read("RIVETHUB_API_SOCKET")?.into(),
            token: read("RIVETHUB_PLUGIN_TOKEN")?,
        })
    }

    #[must_use]
    pub fn rivethub(&self) -> RivetHub {
        RivetHub::new(&self.api_socket, &self.token)
    }
}

#[derive(Debug, Clone)]
pub struct RivetHub {
    socket: PathBuf,
    token: String,
}

impl RivetHub {
    pub fn new(socket: impl Into<PathBuf>, token: impl Into<String>) -> Self {
        Self {
            socket: socket.into(),
            token: token.into(),
        }
    }

    pub async fn own(&self) -> Result<PluginSelf, Error> {
        self.get("/api/plugin/self").await
    }

    pub async fn views_changed<I>(&self, views: I) -> Result<(), Error>
    where
        I: IntoIterator,
        I::Item: Into<String>,
    {
        let changed = PluginViewsChanged {
            views: views.into_iter().map(Into::into).collect(),
        };
        self.post("/api/plugin/views/changed", &changed).await
    }

    pub async fn notify(&self, notice: &PluginNotify) -> Result<(), Error> {
        self.post("/api/plugin/notify", notice).await
    }

    pub async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T, Error> {
        self.request(Method::GET, path, None::<&()>).await
    }

    pub async fn post<B, T>(&self, path: &str, body: &B) -> Result<T, Error>
    where
        B: Serialize + ?Sized,
        T: DeserializeOwned,
    {
        self.request(Method::POST, path, Some(body)).await
    }

    pub async fn request<B, T>(
        &self,
        method: Method,
        path: &str,
        body: Option<&B>,
    ) -> Result<T, Error>
    where
        B: Serialize + ?Sized,
        T: DeserializeOwned,
    {
        let mut builder = Request::builder()
            .method(method)
            .uri(path)
            .header(HOST, "rivethub")
            .header(AUTHORIZATION, format!("Bearer {}", self.token));
        let payload = match body {
            Some(body) => {
                builder = builder.header(CONTENT_TYPE, "application/json");
                serde_json::to_vec(body)?
            }
            None => Vec::new(),
        };
        let request = builder
            .body(Full::new(Bytes::from(payload)))
            .map_err(|error| Error::failed(error.to_string()))?;
        let (status, bytes) = crate::socket::send(&self.socket, request).await?;
        if !status.is_success() {
            let error = serde_json::from_slice(&bytes).unwrap_or_else(|_| GatewayError {
                error: String::from_utf8_lossy(&bytes).into_owned(),
                ..GatewayError::default()
            });
            return Err(Error::RivetHub {
                status: status.as_u16(),
                error: Box::new(error),
            });
        }
        let bytes: &[u8] = if bytes.is_empty() { b"null" } else { &bytes };
        Ok(serde_json::from_slice(bytes)?)
    }
}
