mod checklist;

use rivethub_plugin::contract::{
    JsonObject, PlacedBy, PluginEvent, PluginEventDelivery, PluginToolCall, View, ViewAction,
    ViewActionRefusal, ViewActionRequest, ViewBlock, ViewButton, ViewButtonStyle, ViewEmpty,
    ViewField, ViewInline, ViewInput, ViewListItem, ViewTimeStyle, ViewTone, ViewValue,
};
use rivethub_plugin::{Env, Error, Plugin, RivetHub};
use serde::Deserialize;

use crate::checklist::{Checklist, Filing, Item};

struct App {
    checklist: Checklist,
    rh: RivetHub,
}

#[derive(Deserialize)]
struct AddItem {
    title: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let env = Env::from_env()?;
    let app = App {
        checklist: Checklist::open(&env.data_dir),
        rh: env.rivethub(),
    };
    Plugin::new(app)
        .view(
            "main",
            |app, _| async move { Ok(main_view(&app.checklist)) },
        )
        .action("add", |app, request| async move { add(&app, &request) })
        .action("toggle", |app, request| async move {
            app.checklist.toggle(id(&request))?;
            Ok(vec![ViewAction::Refresh])
        })
        .action("remove", |app, request| async move {
            app.checklist.remove(id(&request))?;
            Ok(vec![ViewAction::Refresh])
        })
        .tool("add_item", |app, call| async move {
            add_item(&app, &call).await
        })
        .events(|app, delivery| async move { filed(&app, delivery).await })
        .serve()
        .await
}

fn id(request: &ViewActionRequest) -> &str {
    request
        .params
        .as_ref()
        .and_then(|params| params.get("id"))
        .and_then(serde_json::Value::as_str)
        .unwrap_or_default()
}

fn call(action: &str, id: &str) -> ViewAction {
    ViewAction::Call {
        action: action.to_owned(),
        params: Some(JsonObject::from_iter([("id".to_owned(), id.into())])),
    }
}

fn add(app: &App, request: &ViewActionRequest) -> Result<Vec<ViewAction>, Error> {
    let title = match request.values.get("title") {
        Some(ViewValue::Text(title)) => title.trim(),
        _ => "",
    };
    if title.is_empty() {
        return Err(ViewActionRefusal::new("Give the item a title")
            .field("title", "Required")
            .into());
    }
    app.checklist.add(title)?;
    Ok(vec![
        ViewAction::Refresh,
        ViewAction::Toast {
            text: format!("Added {title}"),
            tone: Some(ViewTone::Success),
        },
    ])
}

async fn add_item(app: &App, call: &PluginToolCall) -> Result<String, Error> {
    let AddItem { title } = call.parse()?;
    let title = title.trim();
    if title.is_empty() {
        return Err(Error::failed("title must be a non-empty string"));
    }
    let open = app.checklist.add(title)?;
    app.rh.views_changed(["main"]).await?;
    Ok(format!("Added \"{title}\" to the checklist; {open} open."))
}

async fn filed(app: &App, delivery: PluginEventDelivery) -> Result<(), Error> {
    if let PluginEvent::SessionPlaced {
        session_id,
        topic_id,
        by,
    } = delivery.event
    {
        app.checklist.filed(Filing {
            session_id,
            topic_id,
            by,
            at: delivery.at,
        })?;
        app.rh.views_changed(["main"]).await?;
    }
    Ok(())
}

fn main_view(checklist: &Checklist) -> View {
    let items = checklist.items();
    let open = items.iter().filter(|item| !item.done).count();
    View {
        title: "Checklist".to_owned(),
        subtitle: Some(format!("{open} open, {} done", items.len() - open)),
        toolbar: Vec::new(),
        blocks: vec![
            add_form(),
            ViewBlock::List {
                items: items.iter().map(item_row).collect(),
                empty: Some(ViewEmpty {
                    title: "Nothing on the list".to_owned(),
                    text: Some(
                        "Add an item above, or ask an agent to use the add_item tool.".to_owned(),
                    ),
                    button: None,
                }),
            },
            ViewBlock::Section {
                title: Some("Recently filed sessions".to_owned()),
                subtitle: None,
                actions: Vec::new(),
                collapsed: None,
                blocks: vec![ViewBlock::List {
                    items: checklist.filings().iter().map(filing_row).collect(),
                    empty: Some(ViewEmpty {
                        title: "No sessions filed yet".to_owned(),
                        text: Some("Sessions filed into a topic show here.".to_owned()),
                        button: None,
                    }),
                }],
            },
        ],
    }
}

fn add_form() -> ViewBlock {
    ViewBlock::Form {
        id: "add".to_owned(),
        fields: vec![ViewField {
            key: "title".to_owned(),
            label: "New item".to_owned(),
            input: ViewInput::Text { multiline: false },
            value: None,
            required: true,
            help: None,
            placeholder: Some("What needs doing?".to_owned()),
        }],
        buttons: vec![ViewButton {
            label: "Add".to_owned(),
            icon: Some("add".to_owned()),
            style: Some(ViewButtonStyle::Primary),
            action: ViewAction::Call {
                action: "add".to_owned(),
                params: None,
            },
            confirm: None,
            disabled: false,
        }],
    }
}

fn item_row(item: &Item) -> ViewListItem {
    let icon = if item.done { "check_circle" } else { "pending" };
    ViewListItem {
        id: item.id.clone(),
        title: item.title.clone(),
        icon: Some(icon.to_owned()),
        action: Some(call("toggle", &item.id)),
        menu: vec![ViewButton {
            label: "Delete".to_owned(),
            icon: Some("delete".to_owned()),
            style: Some(ViewButtonStyle::Danger),
            action: call("remove", &item.id),
            confirm: None,
            disabled: false,
        }],
        ..ViewListItem::default()
    }
}

fn filing_row(filing: &Filing) -> ViewListItem {
    let by = match filing.by {
        PlacedBy::You => "by you",
        PlacedBy::Categorizer => "by the categorizer",
    };
    let (harness, native) = filing
        .session_id
        .split_once(':')
        .unwrap_or(("", &filing.session_id));
    ViewListItem {
        id: format!("{}-{}", filing.session_id, filing.at),
        title: format!("Session {}", native.get(..8).unwrap_or(native)),
        subtitle: Some(harness.to_owned()),
        icon: Some("folder".to_owned()),
        trailing: vec![
            ViewInline::Badge {
                text: by.to_owned(),
                tone: ViewTone::Neutral,
            },
            ViewInline::Time {
                at: filing.at,
                style: Some(ViewTimeStyle::Relative),
            },
        ],
        action: Some(ViewAction::OpenSession {
            session_id: filing.session_id.clone(),
        }),
        menu: vec![ViewButton {
            label: "Open topic".to_owned(),
            icon: Some("folder_open".to_owned()),
            style: None,
            action: ViewAction::OpenTopic {
                topic_id: filing.topic_id.clone(),
            },
            confirm: None,
            disabled: false,
        }],
    }
}
