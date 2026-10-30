// Generated from philbert440/rivethub-runtime@542f8efdef0080940149a275fbfd883e4e63a6ab contract/accepted.schema.json by npm run contract. Do not edit.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

pub type JsonObject = serde_json::Map<String, serde_json::Value>;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasAnchor {
    pub id: String,
    pub x: f64,
    pub y: f64,
    pub side: CanvasSide,
    pub direction: CanvasDirection,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CanvasArrow {
    #[serde(rename = "none")]
    None,
    #[serde(rename = "end")]
    End,
    #[serde(rename = "start")]
    Start,
    #[serde(rename = "both")]
    Both,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CanvasDirection {
    #[serde(rename = "in")]
    In,
    #[serde(rename = "out")]
    Out,
    #[serde(rename = "both")]
    Both,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasEnd {
    pub node: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub anchor: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum CanvasEvent {
    #[serde(rename = "selected")]
    Selected {
        items: Vec<String>,
    },
    #[serde(rename = "moved")]
    Moved {
        items: Vec<CanvasPosition>,
    },
    #[serde(rename = "connected")]
    Connected {
        from: CanvasEnd,
        to: CanvasEnd,
    },
    #[serde(rename = "deleted")]
    Deleted {
        items: Vec<String>,
    },
    #[serde(rename = "activated")]
    Activated {
        item: String,
    },
    #[serde(rename = "menu")]
    Menu {
        #[serde(skip_serializing_if = "Option::is_none")]
        item: Option<String>,
        choice: String,
        x: f64,
        y: f64,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasEventRequest {
    pub event: CanvasEvent,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<JsonObject>,
    #[serde(default)]
    pub context: ViewContext,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasGrid {
    pub size: f64,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub snap: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum CanvasItem {
    #[serde(rename = "node")]
    Node {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        shapes: Vec<CanvasShape>,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        anchors: Vec<CanvasAnchor>,
        #[serde(skip_serializing_if = "Option::is_none")]
        tooltip: Option<String>,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        menu: Vec<CanvasMenuItem>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        locked: bool,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        decorative: bool,
    },
    #[serde(rename = "connector")]
    Connector {
        id: String,
        from: CanvasEnd,
        to: CanvasEnd,
        route: CanvasRoute,
        #[serde(skip_serializing_if = "Option::is_none")]
        stroke: Option<ColorRole>,
        #[serde(rename = "strokeWidth", skip_serializing_if = "Option::is_none")]
        stroke_width: Option<f64>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        dashed: bool,
        arrow: CanvasArrow,
        #[serde(skip_serializing_if = "Option::is_none")]
        label: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        tooltip: Option<String>,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        menu: Vec<CanvasMenuItem>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        decorative: bool,
    },
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasMenuItem {
    pub id: String,
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub danger: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum CanvasOp {
    #[serde(rename = "upsert")]
    Upsert {
        item: CanvasItem,
    },
    #[serde(rename = "remove")]
    Remove {
        ids: Vec<String>,
    },
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasPosition {
    pub id: String,
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasResponse {
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub ops: Vec<CanvasOp>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub actions: Vec<ViewAction>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CanvasRoute {
    #[serde(rename = "straight")]
    Straight,
    #[serde(rename = "curved")]
    Curved,
    #[serde(rename = "orthogonal")]
    Orthogonal,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasScene {
    pub items: Vec<CanvasItem>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub grid: Option<CanvasGrid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub viewport: Option<CanvasViewport>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum CanvasShape {
    #[serde(rename = "rect")]
    Rect {
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        #[serde(skip_serializing_if = "Option::is_none")]
        radius: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        fill: Option<ColorRole>,
        #[serde(skip_serializing_if = "Option::is_none")]
        stroke: Option<ColorRole>,
        #[serde(rename = "strokeWidth", skip_serializing_if = "Option::is_none")]
        stroke_width: Option<f64>,
    },
    #[serde(rename = "ellipse")]
    Ellipse {
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        #[serde(skip_serializing_if = "Option::is_none")]
        fill: Option<ColorRole>,
        #[serde(skip_serializing_if = "Option::is_none")]
        stroke: Option<ColorRole>,
        #[serde(rename = "strokeWidth", skip_serializing_if = "Option::is_none")]
        stroke_width: Option<f64>,
    },
    #[serde(rename = "text")]
    Text {
        x: f64,
        y: f64,
        text: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        size: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        weight: Option<CanvasWeight>,
        #[serde(skip_serializing_if = "Option::is_none")]
        color: Option<ColorRole>,
        #[serde(skip_serializing_if = "Option::is_none")]
        align: Option<ViewAlign>,
        #[serde(rename = "maxWidth", skip_serializing_if = "Option::is_none")]
        max_width: Option<f64>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        monospace: bool,
    },
    #[serde(rename = "path")]
    Path {
        d: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        fill: Option<ColorRole>,
        #[serde(skip_serializing_if = "Option::is_none")]
        stroke: Option<ColorRole>,
        #[serde(rename = "strokeWidth", skip_serializing_if = "Option::is_none")]
        stroke_width: Option<f64>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        dashed: bool,
    },
    #[serde(rename = "icon")]
    Icon {
        x: f64,
        y: f64,
        name: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        size: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        color: Option<ColorRole>,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CanvasSide {
    #[serde(rename = "top")]
    Top,
    #[serde(rename = "right")]
    Right,
    #[serde(rename = "bottom")]
    Bottom,
    #[serde(rename = "left")]
    Left,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasViewport {
    pub x: f64,
    pub y: f64,
    pub zoom: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CanvasWeight {
    #[serde(rename = "regular")]
    Regular,
    #[serde(rename = "medium")]
    Medium,
    #[serde(rename = "bold")]
    Bold,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ColorRole {
    #[serde(rename = "surface")]
    Surface,
    #[serde(rename = "surfaceContainer")]
    SurfaceContainer,
    #[serde(rename = "surfaceContainerHigh")]
    SurfaceContainerHigh,
    #[serde(rename = "primary")]
    Primary,
    #[serde(rename = "primaryContainer")]
    PrimaryContainer,
    #[serde(rename = "onPrimary")]
    OnPrimary,
    #[serde(rename = "onPrimaryContainer")]
    OnPrimaryContainer,
    #[serde(rename = "secondaryContainer")]
    SecondaryContainer,
    #[serde(rename = "onSurface")]
    OnSurface,
    #[serde(rename = "onSurfaceVariant")]
    OnSurfaceVariant,
    #[serde(rename = "outline")]
    Outline,
    #[serde(rename = "outlineVariant")]
    OutlineVariant,
    #[serde(rename = "info")]
    Info,
    #[serde(rename = "success")]
    Success,
    #[serde(rename = "warning")]
    Warning,
    #[serde(rename = "danger")]
    Danger,
    #[serde(rename = "category1")]
    Category1,
    #[serde(rename = "category2")]
    Category2,
    #[serde(rename = "category3")]
    Category3,
    #[serde(rename = "category4")]
    Category4,
    #[serde(rename = "category5")]
    Category5,
    #[serde(rename = "category6")]
    Category6,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct GatewayError {
    pub error: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
    #[serde(rename = "harnessId", skip_serializing_if = "Option::is_none")]
    pub harness_id: Option<HarnessId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub node: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub retryable: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum HarnessId {
    #[serde(rename = "claude-code")]
    ClaudeCode,
    #[serde(rename = "grok-build")]
    GrokBuild,
    #[serde(rename = "kimi-code")]
    KimiCode,
    #[serde(rename = "hermes")]
    Hermes,
    #[serde(rename = "codex")]
    Codex,
    #[serde(rename = "opencode")]
    Opencode,
    #[serde(rename = "omp")]
    Omp,
    #[serde(rename = "dsh")]
    Dsh,
    #[serde(rename = "cursor")]
    Cursor,
    #[serde(rename = "cowork")]
    Cowork,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Permission {
    #[serde(rename = "memory.read")]
    MemoryRead,
    #[serde(rename = "memory.write")]
    MemoryWrite,
    #[serde(rename = "sessions.read")]
    SessionsRead,
    #[serde(rename = "sessions.control")]
    SessionsControl,
    #[serde(rename = "topics.read")]
    TopicsRead,
    #[serde(rename = "topics.write")]
    TopicsWrite,
    #[serde(rename = "tasks.read")]
    TasksRead,
    #[serde(rename = "tasks.delegate")]
    TasksDelegate,
    #[serde(rename = "agents.read")]
    AgentsRead,
    #[serde(rename = "notifications.send")]
    NotificationsSend,
    #[serde(rename = "host.files.read")]
    HostFilesRead,
    #[serde(rename = "host.files.write")]
    HostFilesWrite,
    #[serde(rename = "host.network")]
    HostNetwork,
    #[serde(rename = "host.exec")]
    HostExec,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PlacedBy {
    #[serde(rename = "you")]
    You,
    #[serde(rename = "categorizer")]
    Categorizer,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginContributions {
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub pages: Vec<PluginPage>,
    #[serde(rename = "topicCards", default, skip_serializing_if = "Vec::is_empty")]
    pub topic_cards: Vec<PluginTopicCard>,
    #[serde(rename = "sessionActions", default, skip_serializing_if = "Vec::is_empty")]
    pub session_actions: Vec<PluginSessionAction>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum PluginEvent {
    #[serde(rename = "session.started")]
    SessionStarted {
        #[serde(rename = "sessionId")]
        session_id: SessionId,
        #[serde(rename = "topicId", skip_serializing_if = "Option::is_none")]
        topic_id: Option<String>,
    },
    #[serde(rename = "session.idle")]
    SessionIdle {
        #[serde(rename = "sessionId")]
        session_id: SessionId,
    },
    #[serde(rename = "session.ended")]
    SessionEnded {
        #[serde(rename = "sessionId")]
        session_id: SessionId,
    },
    #[serde(rename = "session.placed")]
    SessionPlaced {
        #[serde(rename = "sessionId")]
        session_id: SessionId,
        #[serde(rename = "topicId")]
        topic_id: String,
        by: PlacedBy,
    },
    #[serde(rename = "summary.written")]
    SummaryWritten {
        #[serde(rename = "summaryId")]
        summary_id: String,
        #[serde(rename = "sessionId", skip_serializing_if = "Option::is_none")]
        session_id: Option<SessionId>,
        kind: SummaryKind,
        level: u32,
    },
    #[serde(rename = "task.done")]
    TaskDone {
        #[serde(rename = "taskId")]
        task_id: String,
        status: TaskStatus,
    },
    #[serde(rename = "settings.changed")]
    SettingsChanged {
        values: BTreeMap<String, ViewValue>,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginEventDelivery {
    pub seq: u64,
    pub at: i64,
    pub missed: u64,
    pub event: PluginEvent,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PluginEventKind {
    #[serde(rename = "session.started")]
    SessionStarted,
    #[serde(rename = "session.idle")]
    SessionIdle,
    #[serde(rename = "session.ended")]
    SessionEnded,
    #[serde(rename = "session.placed")]
    SessionPlaced,
    #[serde(rename = "summary.written")]
    SummaryWritten,
    #[serde(rename = "task.done")]
    TaskDone,
}

pub type PluginId = String;

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginJob {
    pub id: RouteName,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub schedule: Option<String>,
    #[serde(rename = "timeoutMs", skip_serializing_if = "Option::is_none")]
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PluginJobOutcome {
    #[serde(rename = "succeeded")]
    Succeeded,
    #[serde(rename = "failed")]
    Failed,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginJobRequest {
    #[serde(rename = "runId")]
    pub run_id: String,
    pub trigger: PluginJobTrigger,
    #[serde(rename = "scheduledAt", skip_serializing_if = "Option::is_none")]
    pub scheduled_at: Option<i64>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginJobResult {
    pub outcome: PluginJobOutcome,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PluginJobTrigger {
    #[serde(rename = "schedule")]
    Schedule,
    #[serde(rename = "manual")]
    Manual,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginManifest {
    #[serde(rename = "$schema", skip_serializing_if = "Option::is_none")]
    pub schema: Option<String>,
    pub manifest: ProtocolVersion,
    pub id: PluginId,
    pub name: String,
    pub version: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    pub run: PluginRun,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub permissions: Vec<Permission>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub settings: Vec<ViewField>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tools: Vec<PluginTool>,
    #[serde(default)]
    pub contributes: PluginContributions,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub jobs: Vec<PluginJob>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub events: Vec<PluginEventKind>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginNotify {
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tone: Option<ViewTone>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub action: Option<ViewAction>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginPage {
    pub id: RouteName,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    pub view: RouteName,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginRun {
    pub command: Vec<String>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub env: BTreeMap<String, String>,
    #[serde(rename = "readyTimeoutMs", skip_serializing_if = "Option::is_none")]
    pub ready_timeout_ms: Option<u64>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginSelf {
    pub id: PluginId,
    pub node: String,
    pub version: String,
    pub permissions: Vec<Permission>,
    pub settings: BTreeMap<String, ViewValue>,
    #[serde(rename = "dataDir")]
    pub data_dir: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginSessionAction {
    pub id: RouteName,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    pub action: ViewAction,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginTool {
    pub name: ToolName,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    pub description: String,
    #[serde(rename = "inputSchema")]
    pub input_schema: JsonObject,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub hints: Vec<PluginToolHint>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginToolCall {
    pub arguments: JsonObject,
    #[serde(rename = "sessionId", skip_serializing_if = "Option::is_none")]
    pub session_id: Option<SessionId>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PluginToolHint {
    #[serde(rename = "readOnly")]
    ReadOnly,
    #[serde(rename = "destructive")]
    Destructive,
    #[serde(rename = "idempotent")]
    Idempotent,
    #[serde(rename = "openWorld")]
    OpenWorld,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginToolResult {
    pub text: String,
    #[serde(rename = "isError", default, skip_serializing_if = "std::ops::Not::not")]
    pub is_error: bool,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginTopicCard {
    pub id: RouteName,
    pub title: String,
    pub view: RouteName,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginViewsChanged {
    pub views: Vec<RouteName>,
}

pub type ProtocolVersion = u8;

pub type RouteName = String;

pub type SessionId = String;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SummaryKind {
    #[serde(rename = "leaf")]
    Leaf,
    #[serde(rename = "branch")]
    Branch,
    #[serde(rename = "root")]
    Root,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TaskStatus {
    #[serde(rename = "queued")]
    Queued,
    #[serde(rename = "running")]
    Running,
    #[serde(rename = "awaiting-input")]
    AwaitingInput,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
    #[serde(rename = "killed")]
    Killed,
    #[serde(rename = "timeout")]
    Timeout,
}

pub type ToolName = String;

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct View {
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtitle: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub toolbar: Vec<ViewButton>,
    pub blocks: Vec<ViewBlock>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum ViewAction {
    #[serde(rename = "call")]
    Call {
        action: RouteName,
        #[serde(skip_serializing_if = "Option::is_none")]
        params: Option<JsonObject>,
    },
    #[serde(rename = "navigate")]
    Navigate {
        view: RouteName,
        #[serde(skip_serializing_if = "Option::is_none")]
        params: Option<JsonObject>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        replace: bool,
    },
    #[serde(rename = "dialog")]
    Dialog {
        view: RouteName,
        #[serde(skip_serializing_if = "Option::is_none")]
        params: Option<JsonObject>,
    },
    #[serde(rename = "back")]
    Back,
    #[serde(rename = "refresh")]
    Refresh,
    #[serde(rename = "toast")]
    Toast {
        text: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        tone: Option<ViewTone>,
    },
    #[serde(rename = "copy")]
    Copy {
        text: String,
    },
    #[serde(rename = "openSession")]
    OpenSession {
        #[serde(rename = "sessionId")]
        session_id: SessionId,
    },
    #[serde(rename = "openTopic")]
    OpenTopic {
        #[serde(rename = "topicId")]
        topic_id: String,
    },
    #[serde(rename = "openUrl")]
    OpenUrl {
        url: String,
    },
    #[serde(rename = "download")]
    Download {
        path: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        filename: Option<String>,
    },
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewActionRefusal {
    pub message: String,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub fields: BTreeMap<String, String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewActionRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<JsonObject>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub values: BTreeMap<String, ViewValue>,
    #[serde(default)]
    pub context: ViewContext,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewActionResult {
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub actions: Vec<ViewAction>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ViewAlign {
    #[serde(rename = "start")]
    Start,
    #[serde(rename = "center")]
    Center,
    #[serde(rename = "end")]
    End,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum ViewBlock {
    #[serde(rename = "section")]
    Section {
        #[serde(skip_serializing_if = "Option::is_none")]
        title: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        subtitle: Option<String>,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        actions: Vec<ViewButton>,
        blocks: Vec<ViewBlock>,
        #[serde(skip_serializing_if = "Option::is_none")]
        collapsed: Option<bool>,
    },
    #[serde(rename = "split")]
    Split {
        primary: Vec<ViewBlock>,
        secondary: Vec<ViewBlock>,
        #[serde(skip_serializing_if = "Option::is_none")]
        ratio: Option<f64>,
    },
    #[serde(rename = "tabs")]
    Tabs {
        tabs: Vec<ViewTab>,
        #[serde(skip_serializing_if = "Option::is_none")]
        selected: Option<RouteName>,
    },
    #[serde(rename = "text")]
    Text {
        text: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        tone: Option<ViewTone>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        monospace: bool,
    },
    #[serde(rename = "markdown")]
    Markdown {
        text: String,
    },
    #[serde(rename = "code")]
    Code {
        text: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        language: Option<String>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        follow: bool,
    },
    #[serde(rename = "image")]
    Image {
        path: String,
        alt: String,
    },
    #[serde(rename = "properties")]
    Properties {
        items: Vec<ViewProperty>,
    },
    #[serde(rename = "progress")]
    Progress {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        label: Option<String>,
    },
    #[serde(rename = "notice")]
    Notice {
        tone: ViewTone,
        #[serde(skip_serializing_if = "Option::is_none")]
        title: Option<String>,
        text: String,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        actions: Vec<ViewButton>,
    },
    #[serde(rename = "list")]
    List {
        items: Vec<ViewListItem>,
        #[serde(skip_serializing_if = "Option::is_none")]
        empty: Option<ViewEmpty>,
    },
    #[serde(rename = "table")]
    Table {
        columns: Vec<ViewColumn>,
        rows: Vec<ViewRow>,
        #[serde(skip_serializing_if = "Option::is_none")]
        empty: Option<ViewEmpty>,
    },
    #[serde(rename = "breadcrumbs")]
    Breadcrumbs {
        items: Vec<ViewCrumb>,
    },
    #[serde(rename = "actions")]
    Actions {
        buttons: Vec<ViewButton>,
    },
    #[serde(rename = "form")]
    Form {
        id: RouteName,
        fields: Vec<ViewField>,
        buttons: Vec<ViewButton>,
    },
    #[serde(rename = "canvas")]
    Canvas {
        id: RouteName,
        scene: CanvasScene,
        #[serde(skip_serializing_if = "Option::is_none")]
        height: Option<u32>,
        #[serde(rename = "readOnly", default, skip_serializing_if = "std::ops::Not::not")]
        read_only: bool,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        menu: Vec<CanvasMenuItem>,
    },
    #[serde(rename = "webPanel")]
    WebPanel {
        id: RouteName,
        entry: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        height: Option<u32>,
        #[serde(skip_serializing_if = "Option::is_none")]
        params: Option<JsonObject>,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewButton {
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub style: Option<ViewButtonStyle>,
    pub action: ViewAction,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub confirm: Option<ViewConfirm>,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub disabled: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ViewButtonStyle {
    #[serde(rename = "primary")]
    Primary,
    #[serde(rename = "secondary")]
    Secondary,
    #[serde(rename = "danger")]
    Danger,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewColumn {
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub align: Option<ViewAlign>,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub sortable: bool,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewConfirm {
    pub title: String,
    pub text: String,
    #[serde(rename = "confirmLabel", skip_serializing_if = "Option::is_none")]
    pub confirm_label: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewContext {
    #[serde(rename = "topicId", skip_serializing_if = "Option::is_none")]
    pub topic_id: Option<String>,
    #[serde(rename = "sessionId", skip_serializing_if = "Option::is_none")]
    pub session_id: Option<SessionId>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewCrumb {
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub action: Option<ViewAction>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewEmpty {
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub button: Option<ViewButton>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewField {
    pub key: String,
    pub label: String,
    pub input: ViewInput,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<ViewValue>,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub required: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub help: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub placeholder: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewFile {
    pub name: String,
    #[serde(rename = "mimeType")]
    pub mime_type: String,
    pub data: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum ViewInline {
    #[serde(rename = "text")]
    Text {
        text: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        tone: Option<ViewTone>,
        #[serde(skip_serializing_if = "Option::is_none")]
        icon: Option<String>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        monospace: bool,
    },
    #[serde(rename = "badge")]
    Badge {
        text: String,
        tone: ViewTone,
    },
    #[serde(rename = "time")]
    Time {
        at: i64,
        #[serde(skip_serializing_if = "Option::is_none")]
        style: Option<ViewTimeStyle>,
    },
    #[serde(rename = "duration")]
    Duration {
        ms: u64,
    },
    #[serde(rename = "bytes")]
    Bytes {
        value: u64,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum ViewInput {
    #[serde(rename = "text")]
    Text {
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        multiline: bool,
    },
    #[serde(rename = "secret")]
    Secret,
    #[serde(rename = "number")]
    Number {
        #[serde(skip_serializing_if = "Option::is_none")]
        min: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        max: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        step: Option<f64>,
    },
    #[serde(rename = "toggle")]
    Toggle,
    #[serde(rename = "select")]
    Select {
        options: Vec<ViewOption>,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        multiple: bool,
    },
    #[serde(rename = "file")]
    File {
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        multiple: bool,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        accept: Vec<String>,
    },
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewListItem {
    pub id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtitle: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub trailing: Vec<ViewInline>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub action: Option<ViewAction>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub menu: Vec<ViewButton>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewOption {
    pub value: String,
    pub label: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewProperty {
    pub label: String,
    pub value: ViewInline,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<JsonObject>,
    #[serde(default)]
    pub context: ViewContext,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewRow {
    pub id: String,
    pub cells: Vec<ViewInline>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub action: Option<ViewAction>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub menu: Vec<ViewButton>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ViewTab {
    pub id: RouteName,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub badge: Option<String>,
    pub blocks: Vec<ViewBlock>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ViewTimeStyle {
    #[serde(rename = "relative")]
    Relative,
    #[serde(rename = "absolute")]
    Absolute,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ViewTone {
    #[serde(rename = "neutral")]
    Neutral,
    #[serde(rename = "info")]
    Info,
    #[serde(rename = "success")]
    Success,
    #[serde(rename = "warning")]
    Warning,
    #[serde(rename = "danger")]
    Danger,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ViewValue {
    Bool(bool),
    Number(f64),
    Text(String),
    List(Vec<String>),
    Files(Vec<ViewFile>),
}
