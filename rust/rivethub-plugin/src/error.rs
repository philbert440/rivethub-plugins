use std::fmt;

use crate::contract::{GatewayError, ViewActionRefusal};

#[derive(Debug)]
pub enum Error {
    Refused(ViewActionRefusal),
    Failed(String),
    Missing(&'static str),
    RivetHub {
        status: u16,
        error: Box<GatewayError>,
    },
    Io(std::io::Error),
    Json(serde_json::Error),
    Http(hyper::Error),
}

impl Error {
    pub fn failed(message: impl Into<String>) -> Self {
        Self::Failed(message.into())
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Refused(refusal) => f.write_str(&refusal.message),
            Self::Failed(message) => f.write_str(message),
            Self::Missing(name) => write!(
                f,
                "{name} is not set: run the plug-in from rh or rivethub-plugin-dev"
            ),
            Self::RivetHub { status, error } => match &error.detail {
                Some(detail) => write!(f, "rh answered {status}: {}: {detail}", error.error),
                None => write!(f, "rh answered {status}: {}", error.error),
            },
            Self::Io(error) => error.fmt(f),
            Self::Json(error) => error.fmt(f),
            Self::Http(error) => error.fmt(f),
        }
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Io(error) => Some(error),
            Self::Json(error) => Some(error),
            Self::Http(error) => Some(error),
            Self::Refused(_) | Self::Failed(_) | Self::Missing(_) | Self::RivetHub { .. } => None,
        }
    }
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Self::Io(error)
    }
}

impl From<serde_json::Error> for Error {
    fn from(error: serde_json::Error) -> Self {
        Self::Json(error)
    }
}

impl From<hyper::Error> for Error {
    fn from(error: hyper::Error) -> Self {
        Self::Http(error)
    }
}

impl From<ViewActionRefusal> for Error {
    fn from(refusal: ViewActionRefusal) -> Self {
        Self::Refused(refusal)
    }
}
