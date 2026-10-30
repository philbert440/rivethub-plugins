use std::path::{Path, PathBuf};
use std::sync::{Mutex, MutexGuard, PoisonError};

use rivethub_plugin::Error;
use rivethub_plugin::contract::PlacedBy;
use serde::{Deserialize, Serialize};

const KEPT_FILINGS: usize = 5;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub id: String,
    pub title: String,
    pub done: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Filing {
    pub session_id: String,
    pub topic_id: String,
    pub by: PlacedBy,
    pub at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct State {
    next: u64,
    items: Vec<Item>,
    filings: Vec<Filing>,
}

pub struct Checklist {
    file: PathBuf,
    state: Mutex<State>,
}

impl Checklist {
    pub fn open(data_dir: &Path) -> Self {
        let file = data_dir.join("checklist.json");
        let state = std::fs::read(&file)
            .ok()
            .and_then(|bytes| serde_json::from_slice(&bytes).ok())
            .unwrap_or(State {
                next: 1,
                items: Vec::new(),
                filings: Vec::new(),
            });
        Self {
            file,
            state: Mutex::new(state),
        }
    }

    pub fn items(&self) -> Vec<Item> {
        self.lock().items.clone()
    }

    pub fn filings(&self) -> Vec<Filing> {
        self.lock().filings.clone()
    }

    pub fn add(&self, title: &str) -> Result<usize, Error> {
        self.change(|state| {
            state.items.push(Item {
                id: state.next.to_string(),
                title: title.to_owned(),
                done: false,
            });
            state.next += 1;
        })
    }

    pub fn toggle(&self, id: &str) -> Result<usize, Error> {
        self.change(|state| {
            if let Some(item) = state.items.iter_mut().find(|item| item.id == id) {
                item.done = !item.done;
            }
        })
    }

    pub fn remove(&self, id: &str) -> Result<usize, Error> {
        self.change(|state| state.items.retain(|item| item.id != id))
    }

    pub fn filed(&self, filing: Filing) -> Result<usize, Error> {
        self.change(|state| {
            state.filings.insert(0, filing);
            state.filings.truncate(KEPT_FILINGS);
        })
    }

    fn lock(&self) -> MutexGuard<'_, State> {
        self.state.lock().unwrap_or_else(PoisonError::into_inner)
    }

    fn change(&self, edit: impl FnOnce(&mut State)) -> Result<usize, Error> {
        let mut state = self.lock();
        edit(&mut state);
        let saving = self.file.with_extension("json.tmp");
        std::fs::write(&saving, serde_json::to_vec(&*state)?)?;
        std::fs::rename(&saving, &self.file)?;
        Ok(state.items.iter().filter(|item| !item.done).count())
    }
}
