// Generated from philbert440/rivethub-runtime@ba386c48eca72acb93d9a26bafb9abd30a48253f contract/sent.schema.json by npm run contract. Do not edit.

/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessId".
 */
export type HarnessId =
  | "claude-code"
  | "grok-build"
  | "kimi-code"
  | "hermes"
  | "codex"
  | "opencode"
  | "pi"
  | "qwen-code"
  | "cursor"
  | "cowork";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "KnownHarness".
 */
export type KnownHarness = string;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentStoreBackend".
 */
export type AgentStoreBackend = "postgres" | "file";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionId".
 */
export type SessionId = string;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CatalogAgent".
 */
export type CatalogAgent = Preset | CatalogNode;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "McpInjection".
 */
export type McpInjection = "flag" | "cwdFile" | "persistentConfig" | "none";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Activity".
 */
export type Activity =
  "idle" | "thinking" | "writing" | "speaking" | "editing_code" | "sleeping" | "computer" | "toolbox";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PhonePairingState".
 */
export type PhonePairingState = "pending" | "paired" | "expired";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Notification".
 */
export type Notification =
  | {
      kind: "escalation";
      task_id: string;
      agent_id: string;
      summary: string;
      href: string;
      ts: number;
    }
  | {
      kind: "task.done";
      taskId: string;
      status: TaskStatus;
      ts: number;
    }
  | {
      kind: "workflow.gate";
      runId: string;
      workflowId: string;
      label: string;
      prompt?: string | null;
      href: string;
      ts: number;
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskStatus".
 */
export type TaskStatus = "queued" | "running" | "awaiting-input" | "completed" | "failed" | "killed" | "timeout";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AudioBackend".
 */
export type AudioBackend = "fifo-shim" | "none";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AudioMicErrorCode".
 */
export type AudioMicErrorCode = "busy" | "disabled" | "badHello" | "noRuntime";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AudioMicServerFrame".
 */
export type AudioMicServerFrame =
  | {
      type: "ready";
      device: string;
      sampleRate: number;
      format: AudioFormat;
      backend: AudioBackend;
    }
  | {
      type: "error";
      code: AudioMicErrorCode;
      message: string;
    }
  | {
      type: "stopped";
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AudioFormat".
 */
export type AudioFormat = "s16le";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AudioMicClientFrame".
 */
export type AudioMicClientFrame =
  | {
      type: "hello";
      v: ProtocolVersion;
      sampleRate?: number | null;
      channels?: number | null;
      format?: AudioFormat | null;
    }
  | {
      type: "start";
    }
  | {
      type: "stop";
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ProtocolVersion".
 */
export type ProtocolVersion = number;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "FileEntryKind".
 */
export type FileEntryKind = "dir" | "file";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "FileKind".
 */
export type FileKind = "dir" | "file";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SearchMode".
 */
export type SearchMode = "hybrid" | "fts" | "vector" | "trigram" | "regex";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SummaryKind".
 */
export type SummaryKind = "leaf" | "branch" | "root";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CaptureStatus".
 */
export type CaptureStatus = "unknown";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "BrowseWindow".
 */
export type BrowseWindow = "today" | "yesterday" | "this_morning" | "this_week" | "last_24h" | "last_7d" | "last_14d";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryScope".
 */
export type MemoryScope = "messages" | "summaries" | "both";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryHitSource".
 */
export type MemoryHitSource = "message" | "summary";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Role".
 */
export type Role = "system" | "user" | "assistant" | "tool";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryFallback".
 */
export type MemoryFallback = "trigram";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagEntityType".
 */
export type TagEntityType = "conversation" | "summary";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagState".
 */
export type TagState = "suggested" | "accepted" | "rejected";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryToolName".
 */
export type MemoryToolName =
  | "memory_search"
  | "memory_browse"
  | "memory_stats"
  | "memory_get_full"
  | "memory_append"
  | "memory_ingest_session"
  | "memory_tags";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryBrowseOrder".
 */
export type MemoryBrowseOrder = "asc" | "desc";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ToolResult".
 */
export type ToolResult = string | ContentPart[];
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ContentPart".
 */
export type ContentPart =
  | {
      type: "text";
      text: string;
    }
  | MediaFields
  | MediaFields1;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryHealthStatus".
 */
export type MemoryHealthStatus = "ok" | "degraded" | "error";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "EmbedStatus".
 */
export type EmbedStatus = "ok" | "unavailable";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "QueueStatus".
 */
export type QueueStatus = "available" | "unavailable" | "restricted";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PendingTagAction".
 */
export type PendingTagAction = "add" | "remove";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ProjectRule".
 */
export type ProjectRule = "git-remote" | "git-root" | "cwd-basename";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ProviderRecovery".
 */
export type ProviderRecovery = "retrying" | "permanent";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ContextSource".
 */
export type ContextSource = "spawn" | "default" | "observed";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionMessageRole".
 */
export type SessionMessageRole = "user" | "assistant";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ThinkingLevel".
 */
export type ThinkingLevel = "off" | "low" | "medium" | "high" | "xhigh";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionClientKind".
 */
export type SessionClientKind = "watch" | "unwatch" | "sync";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionWsFrame".
 */
export type SessionWsFrame =
  | {
      kind: "message";
      id: string;
      sessionId: string;
      role: SessionMessageRole;
      text: string;
      ts: number;
      usage?: MessageUsage | null;
      model?: string | null;
      durationMs?: number | null;
      thinking?: boolean | null;
      tools?: string[] | null;
    }
  | {
      kind: "stream";
      session: string;
      event: StreamEvent;
    }
  | TranscriptWsFrame
  | {
      kind: "sessions-dirty";
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StreamEventKind".
 */
export type StreamEventKind =
  "text" | "reasoning" | "tool_start" | "tool_result" | "status" | "interrupt" | "done" | "error";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TranscriptToolStatus".
 */
export type TranscriptToolStatus = "running" | "done" | "error";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TranscriptBlock".
 */
export type TranscriptBlock = "thinking" | "text" | "tool_use" | "tool_result";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Millis".
 */
export type Millis = string;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessSessionStatus".
 */
export type HarnessSessionStatus = "active" | "idle" | "ended" | "error";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Transport".
 */
export type Transport = "protocol";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessSocketRefusalCode".
 */
export type HarnessSocketRefusalCode = "invalid_session_id" | "forbidden";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessSocketRefusal".
 */
export type HarnessSocketRefusal = {
  type: "error";
  code: HarnessSocketRefusalCode;
  message: string;
};
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessSocketMessage".
 */
export type HarnessSocketMessage = {
  type: "sync";
};
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Mux".
 */
export type Mux = "tmux" | "herdr";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PtyState".
 */
export type PtyState = "running" | "exited";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HelloState".
 */
export type HelloState = "running" | "exited";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermServerFrame".
 */
export type TermServerFrame =
  | {
      type: "hello";
      v: ProtocolVersion;
      id: string;
      denSession: string;
      command: string;
      cols: number;
      rows: number;
      state: HelloState;
      exitCode?: number | null;
      mux?: Mux | null;
      owner?: DeviceOwner | null;
    }
  | {
      type: "exit";
      code?: number | null;
      signal?: number | null;
    }
  | {
      type: "owner";
      device?: string | null;
      self: boolean;
      since?: number | null;
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermClientFrame".
 */
export type TermClientFrame =
  | {
      type: "resize";
      cols: number;
      rows: number;
    }
  | {
      type: "claim";
      cols?: number | null;
      rows?: number | null;
    }
  | {
      type: "kill";
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MessageToolCall".
 */
export type MessageToolCall = StreamedPlainToolCall;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "FinishReason".
 */
export type FinishReason = "stop" | "length" | "tool_calls" | "content_filter";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ErrorKind".
 */
export type ErrorKind = "invalid_request_error" | "server_error";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiSlug".
 */
export type WikiSlug = string;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiSourceKind".
 */
export type WikiSourceKind = "summary" | "message" | "conversation" | "task" | "leaf" | "extract-wiki";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentEvent".
 */
export type AgentEvent = {
  v: ProtocolVersion;
  session: string;
} & AgentEvent1;
export type AgentEvent1 =
  | {
      type: "session.start";
      title?: string | null;
      name?: string | null;
      harness?: SessionHarness | null;
      ts?: number | null;
    }
  | {
      type: "session.end";
      ts?: number | null;
    }
  | {
      type: "message.user";
      text: string;
      ts?: number | null;
    }
  | {
      type: "message.agent";
      text: string;
      model?: string | null;
      durationMs?: number | null;
      usage?: AgentUsage | null;
      ts?: number | null;
    }
  | {
      type: "thinking.delta";
      text: string;
      ts?: number | null;
    }
  | {
      type: "tool.start";
      tool: string;
      args?: {
        [k: string]: unknown;
      } | null;
      ts?: number | null;
    }
  | {
      type: "task.plan";
      tasks: string[];
      ts?: number | null;
    }
  | {
      type: "task.check";
      index: number;
      ts?: number | null;
    }
  | {
      type: "activity";
      activity: Activity;
      ts?: number | null;
    }
  | {
      type: "turn.end";
      ts?: number | null;
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionHarness".
 */
export type SessionHarness = string;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentEventKind".
 */
export type AgentEventKind =
  | {
      type: "session.start";
      title?: string | null;
      name?: string | null;
      harness?: SessionHarness | null;
      ts?: number | null;
    }
  | {
      type: "session.end";
      ts?: number | null;
    }
  | {
      type: "message.user";
      text: string;
      ts?: number | null;
    }
  | {
      type: "message.agent";
      text: string;
      model?: string | null;
      durationMs?: number | null;
      usage?: AgentUsage | null;
      ts?: number | null;
    }
  | {
      type: "thinking.delta";
      text: string;
      ts?: number | null;
    }
  | {
      type: "tool.start";
      tool: string;
      args?: {
        [k: string]: unknown;
      } | null;
      ts?: number | null;
    }
  | {
      type: "task.plan";
      tasks: string[];
      ts?: number | null;
    }
  | {
      type: "task.check";
      index: number;
      ts?: number | null;
    }
  | {
      type: "activity";
      activity: Activity;
      ts?: number | null;
    }
  | {
      type: "turn.end";
      ts?: number | null;
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionBroadcast".
 */
export type SessionBroadcast = Snapshot | SessionRemoved | AgentEvent;
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookEventName".
 */
export type HookEventName =
  | "provider:before"
  | "provider:after"
  | "provider:error"
  | "tool:before"
  | "tool:after"
  | "session:start"
  | "session:end"
  | "turn:before"
  | "turn:after"
  | "turn:reflect"
  | "skill:before"
  | "skill:after"
  | "compact:before"
  | "compact:after"
  | "delegation:before"
  | "delegation:after";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ReflectionSource".
 */
export type ReflectionSource = "complexity" | "periodic" | "manual";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DelegationHookStatus".
 */
export type DelegationHookStatus = "completed" | "failed" | "timeout" | "cached";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookContext".
 */
export type HookContext = {
  agentId?: string | null;
  sessionId?: string | null;
  timestamp: number;
  metadata: {
    [k: string]: unknown;
  };
} & HookContext1;
export type HookContext1 =
  | {
      event: "provider:before";
      providerId: string;
      model: string;
      messages: Message[];
      skip?: boolean | null;
    }
  | {
      event: "provider:after";
      providerId: string;
      model: string;
      usage?: HookUsage | null;
      latencyMs: number;
      hasToolCalls: boolean;
    }
  | {
      event: "provider:error";
      providerId: string;
      model: string;
      error: string;
      statusCode?: number | null;
    }
  | {
      event: "tool:before";
      toolName: string;
      args: {
        [k: string]: unknown;
      };
      blocked?: boolean | null;
      blockReason?: string | null;
    }
  | {
      event: "tool:after";
      toolName: string;
      args: {
        [k: string]: unknown;
      };
      result: {
        [k: string]: unknown;
      };
      durationMs: number;
      isError: boolean;
    }
  | {
      event: "session:start";
      platform?: string | null;
      userId?: string | null;
    }
  | {
      event: "session:end";
      turnCount?: number | null;
      totalTokens?: SessionTokens | null;
    }
  | {
      event: "turn:before";
      userMessage: Message;
      skip?: boolean | null;
      skipReason?: string | null;
    }
  | {
      event: "turn:after";
      response: string;
      toolsUsed: string[];
      iterations: number;
      aborted: boolean;
      usage?: HookUsage | null;
    }
  | {
      event: "turn:reflect";
      response: string;
      toolsUsed: string[];
      iterations: number;
      usage?: HookUsage | null;
      complexity: TurnComplexity;
      source: ReflectionSource;
      userMessage: Message;
    }
  | {
      event: "skill:before";
      skillName: string;
      skillLocation: string;
      matchedTriggers: string[];
      matchScore: number;
      skip?: boolean | null;
      skipReason?: string | null;
    }
  | {
      event: "skill:after";
      skillName: string;
      success: boolean;
      toolsUsed: string[];
      iterations: number;
      durationMs: number;
      usage?: HookUsage | null;
    }
  | {
      event: "compact:before";
      messageCount: number;
    }
  | {
      event: "compact:after";
      remainingMessages: number;
      summary?: string | null;
    }
  | {
      event: "delegation:before";
      fromAgent: string;
      toAgent: string;
      task: string;
      chainDepth: number;
      blocked?: boolean | null;
      blockReason?: string | null;
    }
  | {
      event: "delegation:after";
      fromAgent: string;
      toAgent: string;
      task: string;
      status: DelegationHookStatus;
      durationMs: number;
      usage?: HookUsage | null;
      toolsUsed?: string[] | null;
      cached: boolean;
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MessageContent".
 */
export type MessageContent = string | ContentPart[];
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookContextKind".
 */
export type HookContextKind =
  | {
      event: "provider:before";
      providerId: string;
      model: string;
      messages: Message[];
      skip?: boolean | null;
    }
  | {
      event: "provider:after";
      providerId: string;
      model: string;
      usage?: HookUsage | null;
      latencyMs: number;
      hasToolCalls: boolean;
    }
  | {
      event: "provider:error";
      providerId: string;
      model: string;
      error: string;
      statusCode?: number | null;
    }
  | {
      event: "tool:before";
      toolName: string;
      args: {
        [k: string]: unknown;
      };
      blocked?: boolean | null;
      blockReason?: string | null;
    }
  | {
      event: "tool:after";
      toolName: string;
      args: {
        [k: string]: unknown;
      };
      result: {
        [k: string]: unknown;
      };
      durationMs: number;
      isError: boolean;
    }
  | {
      event: "session:start";
      platform?: string | null;
      userId?: string | null;
    }
  | {
      event: "session:end";
      turnCount?: number | null;
      totalTokens?: SessionTokens | null;
    }
  | {
      event: "turn:before";
      userMessage: Message;
      skip?: boolean | null;
      skipReason?: string | null;
    }
  | {
      event: "turn:after";
      response: string;
      toolsUsed: string[];
      iterations: number;
      aborted: boolean;
      usage?: HookUsage | null;
    }
  | {
      event: "turn:reflect";
      response: string;
      toolsUsed: string[];
      iterations: number;
      usage?: HookUsage | null;
      complexity: TurnComplexity;
      source: ReflectionSource;
      userMessage: Message;
    }
  | {
      event: "skill:before";
      skillName: string;
      skillLocation: string;
      matchedTriggers: string[];
      matchScore: number;
      skip?: boolean | null;
      skipReason?: string | null;
    }
  | {
      event: "skill:after";
      skillName: string;
      success: boolean;
      toolsUsed: string[];
      iterations: number;
      durationMs: number;
      usage?: HookUsage | null;
    }
  | {
      event: "compact:before";
      messageCount: number;
    }
  | {
      event: "compact:after";
      remainingMessages: number;
      summary?: string | null;
    }
  | {
      event: "delegation:before";
      fromAgent: string;
      toAgent: string;
      task: string;
      chainDepth: number;
      blocked?: boolean | null;
      blockReason?: string | null;
    }
  | {
      event: "delegation:after";
      fromAgent: string;
      toAgent: string;
      task: string;
      status: DelegationHookStatus;
      durationMs: number;
      usage?: HookUsage | null;
      toolsUsed?: string[] | null;
      cached: boolean;
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookErrorMode".
 */
export type HookErrorMode = "continue" | "abort" | "retry";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookConfigKind".
 */
export type HookConfigKind = "shell" | "http" | "internal";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "RosterCommand".
 */
export type RosterCommand =
  "claude" | "grok" | "kimi" | "opencode" | "hermes" | "codex" | "pi" | "qwen" | "cursor" | "cowork";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ApprovalDecision".
 */
export type ApprovalDecision = "allow" | "deny" | "allowSession";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ApprovalOutcome".
 */
export type ApprovalOutcome = "allow" | "deny" | "allowSession" | "external";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessStatus".
 */
export type HarnessStatus = "working" | "blocked" | "idle";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StatusPhase".
 */
export type StatusPhase = "thinking" | "tool" | "writing" | "prompt";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StatusSource".
 */
export type StatusSource = "herdr" | "transcript" | "hooks" | "protocol";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessEvent".
 */
export type HarnessEvent =
  | {
      type: "assistant-delta";
      sessionId: SessionId;
      text: string;
      turnId?: string | null;
    }
  | {
      type: "reasoning-delta";
      sessionId: SessionId;
      text: string;
      turnId?: string | null;
    }
  | {
      type: "tool-use";
      sessionId: SessionId;
      toolCallId: string;
      name: string;
      input: {
        [k: string]: unknown;
      };
      turnId?: string | null;
    }
  | {
      type: "tool-result";
      sessionId: SessionId;
      toolCallId: string;
      name: string;
      output: string;
      isError?: boolean | null;
      turnId?: string | null;
    }
  | {
      type: "approval-request";
      sessionId: SessionId;
      requestId: string;
      toolCallId?: string | null;
      name: string;
      input: {
        [k: string]: unknown;
      };
      reason?: string | null;
      options?: ApprovalOption[] | null;
    }
  | {
      type: "approval-resolved";
      sessionId: SessionId;
      requestId: string;
      decision: ApprovalOutcome;
    }
  | {
      type: "session-created";
      sessionId: SessionId;
      summary: HarnessSessionSummary;
      supersedes?: SessionId | null;
    }
  | {
      type: "turn-complete";
      sessionId: SessionId;
      turnId?: string | null;
      stopReason?: string | null;
    }
  | {
      type: "error";
      sessionId: SessionId;
      code: string;
      deliveryId?: string | null;
      message: string;
      retryable?: boolean | null;
    }
  | {
      type: "session-updated";
      sessionId: SessionId;
      status: HarnessSessionStatus;
      previousSessionId?: SessionId | null;
      supersedes?: SessionId | null;
      blocked?: boolean | null;
    }
  | {
      type: "transcript";
      sessionId: SessionId;
      rev: number;
      from: number;
      total: number;
      turns: HarnessTranscriptTurn[];
      command: RosterCommand;
      truncatedBefore?: boolean | null;
      contextWindow?: number | null;
      compactAt?: number | null;
      contextSource?: ContextSource | null;
    }
  | HarnessStatusFrame
  | {
      type: "prompt";
      sessionId: SessionId;
      promptId: string;
      kind: PromptKind;
      toolName: string;
      questions: PromptQuestion[];
      resolved?: PromptResolution | null;
      screen?: PromptScreen | null;
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PromptKind".
 */
export type PromptKind = "ask-user";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessModelsSource".
 */
export type HarnessModelsSource = "discovered" | "config" | "merged" | "static";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessCode".
 */
export type HarnessCode =
  | "invalid_session_id"
  | "bad_request"
  | "session_id_collision"
  | "turn_in_flight"
  | "capability_unsupported"
  | "unknown_approval"
  | "unknown_prompt";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskExecutorKind".
 */
export type TaskExecutorKind = "chat-loop" | "harness-session" | "mesh";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskVerdict".
 */
export type TaskVerdict = "completed" | "failed" | "killed" | "timeout" | "budget-exceeded";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ContextRefKind".
 */
export type ContextRefKind = "conversation" | "message" | "task" | "file" | "url" | "wiki";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CriterionKind".
 */
export type CriterionKind = "manual" | "automated";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Effort".
 */
export type Effort = "low" | "medium" | "high";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskIsolation".
 */
export type TaskIsolation = "inherit" | "isolated";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskPromptMode".
 */
export type TaskPromptMode = "task" | "heartbeat";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskPermissionOutcome".
 */
export type TaskPermissionOutcome = "allow" | "deny" | "timeout";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ArtifactKind".
 */
export type ArtifactKind = "file" | "url" | "commit" | "message";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "EvalVerdict".
 */
export type EvalVerdict = "verified" | "refuted" | "escalated";
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskEvent".
 */
export type TaskEvent =
  | {
      type: "den";
      ts: number;
      event: AgentEvent;
    }
  | {
      type: "turn.start";
      ts: number;
      turn: number;
    }
  | {
      type: "turn.end";
      ts: number;
      turn: number;
      usage: TaskUsage;
      harnessSessionId?: SessionId | null;
    }
  | {
      type: "session.spawned";
      ts: number;
      nativeSessionId: string;
      model?: string | null;
    }
  | {
      type: "cost";
      ts: number;
      deltaUsd: number;
      totalUsd: number;
    }
  | {
      type: "log";
      ts: number;
      level: LogLevel;
      message: string;
    }
  | {
      type: "approval-request";
      ts: number;
      taskId: string;
      requestId: string;
      name: string;
      input: {
        [k: string]: unknown;
      };
      toolCallId?: string | null;
    }
  | {
      type: "approval-resolved";
      ts: number;
      taskId: string;
      requestId: string;
      decision: TaskPermissionOutcome;
    };
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "LogLevel".
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface RivetHubContractSentByTheRuntime {
  [k: string]: unknown;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentPreset".
 */
export interface AgentPreset {
  id: string;
  name: string;
  color: string;
  harnessId?: HarnessId | null;
  model: string;
  effort: string;
  systemPrompt: string;
  node?: string | null;
  directory?: string | null;
  sharedLink?: boolean | null;
  nodeBaseUrl?: string | null;
  sortOrder?: number | null;
  createdAt: number;
  updatedAt: number;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentsFile".
 */
export interface AgentsFile {
  agents: AgentPreset[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentPresetCreateRequest".
 */
export interface AgentPresetCreateRequest {
  name: string;
  color?: string | null;
  harnessId?: KnownHarness | null;
  model?: string | null;
  effort?: string | null;
  systemPrompt?: string | null;
  node?: string | null;
  directory?: string | null;
  sharedLink?: boolean | null;
  nodeBaseUrl?: string | null;
  sortOrder?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentPresetUpdate".
 */
export interface AgentPresetUpdate {
  name?: string | null;
  color?: string | null;
  harnessId?: KnownHarness | null;
  model?: string | null;
  effort?: string | null;
  systemPrompt?: string | null;
  node?: string | null;
  directory?: string | null;
  sharedLink?: boolean | null;
  nodeBaseUrl?: string | null;
  sortOrder?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentListResponse".
 */
export interface AgentListResponse {
  agents: AgentPreset[];
  node: string;
  directoryRoot?: string | null;
  sharedDir?: string | null;
  backend?: AgentStoreBackend | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentResponse".
 */
export interface AgentResponse {
  agent: AgentPreset;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessDescriptor".
 */
export interface HarnessDescriptor {
  installed?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DelegatedSessionLink".
 */
export interface DelegatedSessionLink {
  taskId: string;
  parentTaskId?: string | null;
  spawnedSessionId: SessionId;
  parentSessionId: SessionId;
  agentName?: string | null;
  model?: string | null;
  owner?: string | null;
  harnessId?: HarnessId | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "UserTurnAttachment".
 */
export interface UserTurnAttachment {
  mime: string;
  pathOrUri: string;
  name?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "UserTurn".
 */
export interface UserTurn {
  deliveryId?: string | null;
  model?: string | null;
  effort?: string | null;
  text: string;
  attachments?: UserTurnAttachment[] | null;
  systemPrompt?: string | null;
  bypassDialogGate?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SendUserTurnResult".
 */
export interface SendUserTurnResult {
  dismissedDialog?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "preset".
 */
export interface Preset {
  id: string;
  name: string;
  node: string;
  local: boolean;
  harnessId?: HarnessId | null;
  model?: string | null;
  directory?: string | null;
  implemented?: boolean | null;
  gap?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CatalogNode".
 */
export interface CatalogNode {
  id: string;
  node: string;
  local: boolean;
  provider?: string | null;
  model?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CatalogCommand".
 */
export interface CatalogCommand {
  name: string;
  description: string;
  argHint?: string | null;
  source: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CatalogExecutorEntry".
 */
export interface CatalogExecutorEntry {
  key: string;
  capabilities: HarnessExecutorCapabilities;
  commands: CatalogCommand[];
  harnessId?: HarnessId | null;
  implemented?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessExecutorCapabilities".
 */
export interface HarnessExecutorCapabilities {
  steerable: boolean;
  multiTurn: boolean;
  structuredStream: boolean;
  usageInResult: boolean;
  sessionIdCapture: boolean;
  slashCommands: boolean;
  effortSelection: boolean;
  mcpInjection: McpInjection;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CatalogSkillEntry".
 */
export interface CatalogSkillEntry {
  name: string;
  description: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CatalogSheet".
 */
export interface CatalogSheet {
  node: string;
  agents: CatalogAgent[];
  executors: CatalogExecutorEntry[];
  tools: string[];
  skills: CatalogSkillEntry[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CatalogAgentsResponse".
 */
export interface CatalogAgentsResponse {
  agents: CatalogAgent[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "OutcomeBucket".
 */
export interface OutcomeBucket {
  tasks: number;
  completed: number;
  failed: number;
  verified: number;
  refuted: number;
  escalated: number;
  diverged: number;
  divergenceRate: number;
  totalCostUsd?: number | null;
  avgDurationMs?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "OutcomesFilter".
 */
export interface OutcomesFilter {
  since?: string | null;
  until?: string | null;
  agentId?: string | null;
  origin?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "OutcomesResponse".
 */
export interface OutcomesResponse {
  filter: OutcomesFilter;
  totals: OutcomeBucket;
  byAgent: {
    [k: string]: OutcomeBucket;
  };
  byExecutor: {
    [k: string]: OutcomeBucket;
  };
  byDay: {
    [k: string]: OutcomeBucket;
  };
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MeshOverview".
 */
export interface MeshOverview {
  updatedAt: number;
  nodes: MeshOverviewNode[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MeshOverviewNode".
 */
export interface MeshOverviewNode {
  id: string;
  name: string;
  denUrl: string;
  online: boolean;
  sessions?: number | null;
  latest?: MeshLatest | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MeshLatest".
 */
export interface MeshLatest {
  activity: Activity;
  title: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "NodeCapabilities".
 */
export interface NodeCapabilities {
  subsystems: Subsystems;
  harnesses: HarnessCapability[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Subsystems".
 */
export interface Subsystems {
  den: boolean;
  devices: boolean;
  mesh: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessCapability".
 */
export interface HarnessCapability {
  harnessId: HarnessId;
  list: boolean;
  read: boolean;
  drive: boolean;
  resume: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessInspectCapability".
 */
export interface HarnessInspectCapability {
  list: boolean;
  read: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessDriveCapability".
 */
export interface HarnessDriveCapability {
  drive: boolean;
  resume: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MeshDevice".
 */
export interface MeshDevice {
  id: string;
  name: string;
  publicKey: string;
  address: string;
  createdAt: number;
  enrolledAt?: number | null;
  lastHandshake?: number | null;
  pgRole?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceListResponse".
 */
export interface DeviceListResponse {
  devices: MeshDevice[];
  pending: PendingEnrollment[];
  relayConfigured: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PendingEnrollment".
 */
export interface PendingEnrollment {
  id: string;
  name: string;
  address: string;
  createdAt: number;
  expiresAt: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StoredPending".
 */
export interface StoredPending {
  id: string;
  name: string;
  token: string;
  address: string;
  createdAt: number;
  expiresAt: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceRosterFile".
 */
export interface DeviceRosterFile {
  v: number;
  devices: MeshDevice[];
  pending: StoredPending[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceCreateRequest".
 */
export interface DeviceCreateRequest {
  name: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "rivet-mesh-enroll".
 */
export interface RivetMeshEnroll {
  v: number;
  gateway: string;
  token: string;
  config: DeviceEnrollConfig;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceEnrollConfig".
 */
export interface DeviceEnrollConfig {
  sharedHost: string;
  sharedExport: string;
  pgUrl: string;
  embedUrl: string;
  wgEndpoint: string;
  wgPeerPublicKey: string;
  wgAddress: string;
  wgAllowedIps: string;
  homeSubnet: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceCreateResponse".
 */
export interface DeviceCreateResponse {
  pending: PendingEnrollment;
  qr: RivetMeshEnroll;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "EnrolledDevice".
 */
export interface EnrolledDevice {
  id: string;
  name: string;
  address: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SignedCertificate".
 */
export interface SignedCertificate {
  leaf: string;
  chain: string[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceEnrollResponse".
 */
export interface DeviceEnrollResponse {
  ok: boolean;
  device: EnrolledDevice;
  config: DeviceEnrollConfig;
  certificate: SignedCertificate;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PairRedeemResponse".
 */
export interface PairRedeemResponse {
  deviceId: string;
  certificate: SignedCertificate;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PairingRecord".
 */
export interface PairingRecord {
  v: number;
  deviceId: string;
  name: string;
  expiresAt: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceEnrollRequest".
 */
export interface DeviceEnrollRequest {
  token?: string | null;
  publicKey?: string | null;
  name?: string | null;
  csr?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PhonePairingCode".
 */
export interface PhonePairingCode {
  deviceId: string;
  gateway: string;
  expiresAt: number;
  qrText: string;
  reshown: number;
  addedToUsers: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PhonePairingStatus".
 */
export interface PhonePairingStatus {
  state: PhonePairingState;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PhonePairingAvailability".
 */
export interface PhonePairingAvailability {
  available: boolean;
  reason?: string | null;
  gateway?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PhonePairingRequest".
 */
export interface PhonePairingRequest {
  name: string;
  host?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AudioStatus".
 */
export interface AudioStatus {
  enabled: boolean;
  backend: AudioBackend;
  device: string;
  sampleRate: number;
  channels: number;
  format: AudioFormat;
  fifoPath: string;
  armed: boolean;
  publisherId?: string | null;
  armedAt?: number | null;
  bytesWritten: number;
  runtimeReady: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AudioHealth".
 */
export interface AudioHealth {
  ok: boolean;
  runtimeReady: boolean;
  fifoPath: string;
  message?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "VoiceSpeakRequest".
 */
export interface VoiceSpeakRequest {
  input: string;
  instructions?: string | null;
  voice?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "VoiceTranscribeResponse".
 */
export interface VoiceTranscribeResponse {
  text: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceFileEntry".
 */
export interface DeviceFileEntry {
  name: string;
  type: FileEntryKind;
  size: number;
  mtime: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "FilesListResponse".
 */
export interface FilesListResponse {
  path: string;
  root: string;
  entries: DeviceFileEntry[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StagedUploadResponse".
 */
export interface StagedUploadResponse {
  uri: string;
  name: string;
  mime: string;
  size: number;
  expiresAt: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "FileEntry".
 */
export interface FileEntry {
  name: string;
  type: FileKind;
  size: number;
  mtime: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "FileList".
 */
export interface FileList {
  path: string;
  root: string;
  entries: FileEntry[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "FileChanged".
 */
export interface FileChanged {
  ok: boolean;
  path: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemorySearchToolArgs".
 */
export interface MemorySearchToolArgs {
  since?: string | null;
  before?: string | null;
  window?: BrowseWindow | null;
  expand?: boolean | null;
  synthesize?: boolean | null;
  query: string;
  mode?: SearchMode | null;
  scope?: MemoryScope | null;
  limit?: number | null;
  agent?: string | null;
  tag?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemorySearchHit".
 */
export interface MemorySearchHit {
  chunk?: MemoryChunkMatch | null;
  id: string;
  source: MemoryHitSource;
  content: string;
  createdAt: string;
  score: number;
  role?: Role | null;
  agent?: string | null;
  kind?: SummaryKind | null;
  toolName?: string | null;
  conversationId?: string | null;
  sessionId?: string | null;
  fallback?: MemoryFallback | null;
  tags?: TagWire[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryChunkMatch".
 */
export interface MemoryChunkMatch {
  index: number;
  total: number;
  charStart: number;
  charEnd: number;
  content: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagWire".
 */
export interface TagWire {
  id: string;
  entityType: TagEntityType;
  entityId: string;
  key: string;
  value: string;
  display: string;
  source: string;
  state: TagState;
  confidence?: number | null;
  proposedBy: string;
  reason: string;
  decidedBy?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryDegraded".
 */
export interface MemoryDegraded {
  reason: string;
  effect: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemorySearchResponse".
 */
export interface MemorySearchResponse {
  query: string;
  scope: MemoryScope;
  degraded?: MemoryDegraded | null;
  fallback?: MemoryFallback | null;
  results: MemorySearchHit[];
  expanded?: MemoryEntry[];
  synthesis?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryEntry".
 */
export interface MemoryEntry {
  id?: string | null;
  sessionId: string;
  agent: string;
  channel: string;
  role: Role;
  content: string;
  toolName?: string | null;
  toolArgs?: {
    [k: string]: unknown;
  } | null;
  toolResult?: string | null;
  metadata?: {
    [k: string]: unknown;
  } | null;
  createdAt?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryBrowseToolArgs".
 */
export interface MemoryBrowseToolArgs {
  conversation_id?: string | null;
  include_tools?: boolean | null;
  since?: string | null;
  before?: string | null;
  window?: BrowseWindow | null;
  agent?: string | null;
  tag?: string | null;
  limit?: number | null;
  order?: MemoryBrowseOrder | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryAppendToolArgs".
 */
export interface MemoryAppendToolArgs {
  session_id: string;
  content: string;
  role: Role;
  tool_name?: string | null;
  tool_args?: {
    [k: string]: unknown;
  } | null;
  tool_result?: string | null;
  event_id?: string | null;
  agent?: string | null;
  persona?: string | null;
  source?: string | null;
  channel?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryIngestMessage".
 */
export interface MemoryIngestMessage {
  role: Role;
  content: string;
  created_at?: string | null;
  tool_calls?: MemoryIngestToolCall[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryIngestToolCall".
 */
export interface MemoryIngestToolCall {
  id?: string | null;
  name: string;
  input?: {
    [k: string]: unknown;
  } | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryIngestSessionToolArgs".
 */
export interface MemoryIngestSessionToolArgs {
  session_id: string;
  messages: MemoryIngestMessage[];
  agent?: string | null;
  persona?: string | null;
  source?: string | null;
  channel?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryGetFullToolArgs".
 */
export interface MemoryGetFullToolArgs {
  id?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryTagsToolArgs".
 */
export interface MemoryTagsToolArgs {
  entity_type?: string | null;
  entity_id?: string | null;
  session_key?: string | null;
  agent?: string | null;
  key?: string | null;
  value?: string | null;
  tag?: string | null;
  display?: string | null;
  state?: TagState | null;
  ids?: string[] | null;
  session_keys?: string[] | null;
  entries?: TagEntryPair[] | null;
  parent_value?: string | null;
  aliases?: string[] | null;
  from?: string | null;
  into?: string | null;
  reason?: string | null;
  decided_by?: string | null;
  limit?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagEntryPair".
 */
export interface TagEntryPair {
  key: string;
  value: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryToolResponse".
 */
export interface MemoryToolResponse {
  ok: boolean;
  result: ToolResult;
}
export interface MediaFields {
  type: "image";
}
export interface MediaFields1 {
  type: "video";
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MediaFields".
 */
export interface MediaFields2 {
  data?: string | null;
  url?: string | null;
  mimeType?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryBrowseMessage".
 */
export interface MemoryBrowseMessage {
  id: string;
  role: Role;
  agent?: string | null;
  content: string;
  createdAt: string;
  conversationId?: string | null;
  sessionId?: string | null;
  toolName?: string | null;
  tags?: TagWire[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryBrowseResponse".
 */
export interface MemoryBrowseResponse {
  messages: MemoryBrowseMessage[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TopTool".
 */
export interface TopTool {
  tool: string;
  count: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "RecentSession".
 */
export interface RecentSession {
  sessionId: string;
  title?: string | null;
  agent: string;
  lastActive: number;
  messages: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryStatsResponse".
 */
export interface MemoryStatsResponse {
  conversations: number;
  messages: number;
  toolCalls: number;
  summaries: number;
  embedQueueDepth: number;
  embeddedMessages: number;
  failedEmbeddings: number;
  topTools: TopTool[];
  recentSessions: RecentSession[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "EmbedHealth".
 */
export interface EmbedHealth {
  status: EmbedStatus;
  error?: string | null;
  impact?: string | null;
  checkedAt?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryHealthResponse".
 */
export interface MemoryHealthResponse {
  observedAt?: string | null;
  queueStatus?: QueueStatus | null;
  queues?: QueueHealth | null;
  compaction?: SummarizerHealth | null;
  failedEmbeddings?: number | null;
  skippedEmbeddings?: number | null;
  capture?: CaptureHealth | null;
  status: MemoryHealthStatus;
  embeddings: EmbedHealth;
  embedQueueDepth: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "QueueHealth".
 */
export interface QueueHealth {
  task: string;
  pending: number;
  running: number;
  scheduled: number;
  dead: number;
  oldestPendingMinutes?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SummarizerHealth".
 */
export interface SummarizerHealth {
  eligible: boolean;
  activeTail: boolean;
  belowFloor: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CaptureHealth".
 */
export interface CaptureHealth {
  status: CaptureStatus;
  impact: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PendingTagWire".
 */
export interface PendingTagWire {
  id: string;
  entityType: TagEntityType;
  entityId: string;
  key: string;
  value: string;
  display: string;
  source: string;
  state: TagState;
  confidence?: number | null;
  proposedBy: string;
  reason: string;
  decidedBy?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  action?: PendingTagAction | null;
  sessionKey?: string | null;
  title?: string | null;
  agent?: string | null;
  conversationId?: string | null;
  excerpt?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryTagsDecideRequest".
 */
export interface MemoryTagsDecideRequest {
  ids?: string[] | null;
  state?: TagState | null;
  decided_by?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryTagsAddRequest".
 */
export interface MemoryTagsAddRequest {
  entity_type?: string | null;
  entity_id?: string | null;
  session_key?: string | null;
  agent?: string | null;
  tag?: string | null;
  key?: string | null;
  value?: string | null;
  display?: string | null;
  reason?: string | null;
  decided_by?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemoryTagsLookupRequest".
 */
export interface MemoryTagsLookupRequest {
  session_keys?: string[] | null;
  states?: string[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyEntry".
 */
export interface TagTaxonomyEntry {
  key: string;
  value: string;
  display: string;
  parentValue?: string | null;
  aliases: string[];
  state: TagState;
  source: string;
  reason: string;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyWire".
 */
export interface TagTaxonomyWire {
  key: string;
  entries: TagTaxonomyEntry[];
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyUpsertRequest".
 */
export interface TagTaxonomyUpsertRequest {
  key?: string | null;
  value?: string | null;
  display?: string | null;
  parent_value?: string | null;
  aliases?: string[] | null;
  reason?: string | null;
  decided_by?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyDecideRequest".
 */
export interface TagTaxonomyDecideRequest {
  entries?: TagEntryPair[] | null;
  state?: TagState | null;
  decided_by?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyMerge".
 */
export interface TagTaxonomyMerge {
  key: string;
  from: string;
  into: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyMergeRequest".
 */
export interface TagTaxonomyMergeRequest {
  key?: string | null;
  from?: string | null;
  into?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyMergeResult".
 */
export interface TagTaxonomyMergeResult {
  moved: number;
  dropped: number;
  into: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagCount".
 */
export interface TagCount {
  key: string;
  value: string;
  display: string;
  conversations: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagListResult".
 */
export interface TagListResult {
  tags: TagWire[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PendingTagListResult".
 */
export interface PendingTagListResult {
  tags: PendingTagWire[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagCountsResult".
 */
export interface TagCountsResult {
  counts: TagCount[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyListResult".
 */
export interface TagTaxonomyListResult {
  entries: TagTaxonomyEntry[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagDecisionResult".
 */
export interface TagDecisionResult {
  changed: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagAddResult".
 */
export interface TagAddResult {
  tag: TagWire;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagLookupResult".
 */
export interface TagLookupResult {
  sessions: {
    [k: string]: TagWire[];
  };
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TagTaxonomyUpsertResult".
 */
export interface TagTaxonomyUpsertResult {
  entry: TagTaxonomyEntry;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ProjectRuleResult".
 */
export interface ProjectRuleResult {
  key: string;
  rule: ProjectRule;
  gitRoot?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HealthzResponse".
 */
export interface HealthzResponse {
  ok: boolean;
  sessions: number;
  name: string;
  node: string;
  degraded?: string | null;
  degradedProviders?: DegradedProvider[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DegradedProvider".
 */
export interface DegradedProvider {
  id: string;
  recovery: ProviderRecovery;
  reason: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "GatewayError".
 */
export interface GatewayError {
  error: string;
  detail?: string | null;
  hint?: string | null;
  code?: string | null;
  harnessId?: HarnessId | null;
  node?: string | null;
  retryable?: boolean | null;
  reason?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "OkReply".
 */
export interface OkReply {
  ok: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "EventsIngested".
 */
export interface EventsIngested {
  ok: boolean;
  ingested: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PairRedeemRequest".
 */
export interface PairRedeemRequest {
  token: string;
  csr?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "RosterFile".
 */
export interface RosterFile {
  default: string;
  cwd: string | null;
  env: {
    [k: string]: string;
  };
  commands: {
    [k: string]: RosterEntry;
  };
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "RosterEntry".
 */
export interface RosterEntry {
  label: string;
  cmd: string[];
  room: boolean | null;
  cwd: string | null;
  env: {
    [k: string]: string;
  };
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TranscriptTurn".
 */
export interface TranscriptTurn {
  role: Role;
  text: string;
  ts?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TranscriptResponse".
 */
export interface TranscriptResponse {
  id: string;
  command: string;
  turns: TranscriptTurn[];
  contextWindow?: number | null;
  compactAt?: number | null;
  contextSource?: ContextSource | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionSummary".
 */
export interface SessionSummary {
  id: string;
  lastActive: number;
  messages: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionList".
 */
export interface SessionList {
  sessions: SessionSummary[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MessageList".
 */
export interface MessageList {
  messages: SessionMessage[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionMessage".
 */
export interface SessionMessage {
  id: string;
  sessionId: string;
  role: SessionMessageRole;
  text: string;
  ts: number;
  usage?: MessageUsage | null;
  model?: string | null;
  durationMs?: number | null;
  thinking?: boolean | null;
  tools?: string[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MessageUsage".
 */
export interface MessageUsage {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionPostRequest".
 */
export interface SessionPostRequest {
  excludeTools?: string[] | null;
  text: string;
  userId?: string | null;
  agent?: string | null;
  thinking?: ThinkingLevel | null;
  systemPrompt?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionPostAccepted".
 */
export interface SessionPostAccepted {
  accepted: boolean;
  session: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionPostReply".
 */
export interface SessionPostReply {
  message: SessionMessage;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionWsClientMessage".
 */
export interface SessionWsClientMessage {
  type: SessionClientKind;
  session: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StreamEvent".
 */
export interface StreamEvent {
  type: StreamEventKind;
  content: string;
  metadata?: {
    [k: string]: unknown;
  } | null;
}
export interface TranscriptWsFrame {
  kind: "transcript";
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessTranscriptTurn".
 */
export interface HarnessTranscriptTurn {
  role: SessionMessageRole;
  text: string;
  thinking?: string | null;
  tools?: HarnessTranscriptTool[] | null;
  usage?: MessageUsage | null;
  model?: string | null;
  stopReason?: string | null;
  lastBlock?: TranscriptBlock | null;
  complete?: boolean;
  compact?: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessTranscriptTool".
 */
export interface HarnessTranscriptTool {
  name: string;
  status: TranscriptToolStatus;
  args?: {
    [k: string]: unknown;
  } | null;
  id?: string | null;
  input?: {
    [k: string]: unknown;
  } | null;
  resultText?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TranscriptWsFrame".
 */
export interface TranscriptWsFrame1 {
  session: string;
  rev: number;
  from: number;
  turns: HarnessTranscriptTurn[];
  total: number;
  command: string;
  truncatedBefore?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessSessionTranscriptResponse".
 */
export interface HarnessSessionTranscriptResponse {
  sessionId: SessionId;
  harnessId: HarnessId;
  turns: HarnessTranscriptTurn[];
  contextWindow: number;
  compactAt: number;
  contextSource: ContextSource;
  redirectedTo?: SessionId | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessTurnAccepted".
 */
export interface HarnessTurnAccepted {
  ok: boolean;
  sessionId: SessionId;
  redirectedTo?: SessionId | null;
  dismissedDialog?: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessSessionResponse".
 */
export interface HarnessSessionResponse {
  sessionId: SessionId;
  harnessId: HarnessId;
  title?: string | null;
  cwd?: string | null;
  createdAt: Millis;
  updatedAt: Millis;
  status: HarnessSessionStatus;
  blocked?: boolean | null;
  supersedes?: SessionId | null;
  model?: string | null;
  parentSessionId?: SessionId | null;
  agentName?: string | null;
  taskId?: string | null;
  effort?: string | null;
  transport?: Transport | null;
  redirectedTo?: SessionId | null;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermSpawnRequest".
 */
export interface TermSpawnRequest {
  command?: string | null;
  model?: string | null;
  effort?: string | null;
  session?: string | null;
  resume?: string | null;
  agentId?: string | null;
  force?: boolean | null;
  cols?: number | null;
  rows?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermAttachInfo".
 */
export interface TermAttachInfo {
  socket: string;
  session: string;
  host: string;
  sshUser: string;
  local: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermSpawnResponse".
 */
export interface TermSpawnResponse {
  harnessSessionId?: SessionId | null;
  id: string;
  denSession: string;
  command: string;
  cwd?: string | null;
  pid: number;
  createdAt: number;
  mux?: Mux | null;
  reattached?: boolean | null;
  attach?: TermAttachInfo | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PtyInfo".
 */
export interface PtyInfo {
  id: string;
  denSession: string;
  command: string;
  state: PtyState;
  pid?: number | null;
  attached: number;
  exitCode?: number | null;
  createdAt: number;
  lastOutputTs?: number | null;
  cols?: number | null;
  rows?: number | null;
  mux?: Mux | null;
  persisted?: boolean | null;
  reattached?: boolean | null;
  attach?: TermAttachInfo | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PtyList".
 */
export interface PtyList {
  ptys: PtyInfo[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermCommand".
 */
export interface TermCommand {
  id: string;
  label: string;
  room: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermConfig".
 */
export interface TermConfig {
  enabled: boolean;
  default: string;
  maxPtys: number;
  active: number;
  commands: TermCommand[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermInjectRequest".
 */
export interface TermInjectRequest {
  session: string;
  text: string;
  submit?: boolean | null;
  interrupt?: boolean | null;
  bypassDialogGate?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TermInjectResponse".
 */
export interface TermInjectResponse {
  ok: boolean;
  ptyId: string;
  dismissedDialog?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "DeviceOwner".
 */
export interface DeviceOwner {
  device?: string | null;
  self: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "UploadCreated".
 */
export interface UploadCreated {
  id: string;
  name: string;
  bytes: number;
  mediaType: string;
  expiresAt: string;
  session?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "UploadList".
 */
export interface UploadList {
  uploads: UploadCreated[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "UsersRegistry".
 */
export interface UsersRegistry {
  ownerUserId: string;
  unmappedIsOwner: boolean;
  localStores?: boolean | null;
  users: {
    [k: string]: UserRecord;
  };
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "UserRecord".
 */
export interface UserRecord {
  id?: string | null;
  devices?: string[] | null;
  pgUrl?: string | null;
  envFile?: string | null;
  persona?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ChatRequest".
 */
export interface ChatRequest {
  model: string;
  messages: OpenAiMessage[];
  stream: boolean | null;
  max_tokens: number | null;
  stream_options: StreamOptions | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "OpenAiMessage".
 */
export interface OpenAiMessage {
  role: Role;
  content: string | null;
  reasoning_content?: string | null;
  tool_calls?: MessageToolCall[] | null;
  tool_call_id?: string | null;
}
export interface StreamedPlainToolCall {
  type: "function";
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StreamOptions".
 */
export interface StreamOptions {
  include_usage: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "FunctionDelta".
 */
export interface FunctionDelta {
  name?: string | null;
  arguments?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StreamedPlainToolCall".
 */
export interface StreamedPlainToolCall1 {
  index?: number | null;
  id?: string | null;
  function: FunctionDelta;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "chat.completion".
 */
export interface ChatCompletion {
  id: string;
  created: number;
  model: string;
  choices: CompletionChoice[];
  usage?: Usage | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CompletionChoice".
 */
export interface CompletionChoice {
  index: number;
  message: OpenAiMessage;
  finish_reason: FinishReason;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Usage".
 */
export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: PromptTokensDetails | null;
  completion_tokens_details?: CompletionTokensDetails | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PromptTokensDetails".
 */
export interface PromptTokensDetails {
  cached_tokens: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CompletionTokensDetails".
 */
export interface CompletionTokensDetails {
  reasoning_tokens: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "chat.completion.chunk".
 */
export interface ChatCompletionChunk {
  id: string;
  created: number;
  model: string;
  choices: ChunkChoice[];
  usage?: Usage | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ChunkChoice".
 */
export interface ChunkChoice {
  index: number;
  delta: CompletionDelta;
  finish_reason: FinishReason | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CompletionDelta".
 */
export interface CompletionDelta {
  role?: Role | null;
  content?: string | null;
  reasoning_content?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "list".
 */
export interface List {
  data: Model[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "model".
 */
export interface Model {
  id: string;
  created: number;
  owned_by: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ErrorDetail".
 */
export interface ErrorDetail {
  message: string;
  type: ErrorKind;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ErrorResponse".
 */
export interface ErrorResponse {
  error: ErrorDetail;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Conversation".
 */
export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: OpenAiMessage[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Conversations".
 */
export interface Conversations {
  conversations: Conversation[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ConversationTitle".
 */
export interface ConversationTitle {
  title: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiQuery".
 */
export interface WikiQuery {
  q: string | null;
  tag: string | null;
  limit: number | null;
  offset: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiPageQuery".
 */
export interface WikiPageQuery {
  slug: WikiSlug;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiHistoryEntry".
 */
export interface WikiHistoryEntry {
  date: string;
  title: string;
  body: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiCitation".
 */
export interface WikiCitation {
  summaryId: string;
  date?: Millis | null;
  kind?: string | null;
  note?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiSource".
 */
export interface WikiSource {
  kind: WikiSourceKind;
  ids: string[];
  conversationId?: string | null;
  span?: WikiSourceSpan | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiSourceSpan".
 */
export interface WikiSourceSpan {
  earliest: Millis;
  latest: Millis;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiPageResponse".
 */
export interface WikiPageResponse {
  slug: string;
  title: string;
  aliases: string[];
  tags: string[];
  entities: string[];
  currentState: string;
  article?: string | null;
  seeAlso?: string[] | null;
  history: WikiHistoryEntry[];
  citations: WikiCitation[];
  markdown: string;
  sources: WikiSource[];
  gitSha?: string | null;
  lastVerified?: Millis | null;
  updatedAt: Millis;
  related?: string[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiMissSuggestion".
 */
export interface WikiMissSuggestion {
  slug: string;
  title: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiMissBody".
 */
export interface WikiMissBody {
  error: string;
  suggestions: WikiMissSuggestion[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiRedLink".
 */
export interface WikiRedLink {
  entity: string;
  referencedBy: string[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiGapsResponse".
 */
export interface WikiGapsResponse {
  redLinks: WikiRedLink[];
  stalest: string[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiTopic".
 */
export interface WikiTopic {
  slug: string;
  title: string;
  tags: string[];
  entities: string[];
  updatedAt: Millis;
  excerpt: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "WikiTopicList".
 */
export interface WikiTopicList {
  topics: WikiTopic[];
  total: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AgentUsage".
 */
export interface AgentUsage {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "LiveSessionSummary".
 */
export interface LiveSessionSummary {
  id: string;
  name: string;
  harness?: SessionHarness | null;
  lastEventTs?: number | null;
  pty?: string | null;
  contextWindow?: number | null;
  compactAt?: number | null;
  contextSource?: ContextSource | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionLogLine".
 */
export interface SessionLogLine {
  who: string;
  text: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionView".
 */
export interface SessionView {
  title: string;
  activity: Activity;
  tool?: string | null;
  tasks: string[];
  thought: string;
  lastMessage: string;
  log: SessionLogLine[];
  term: string[];
  ended: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "LiveSessionList".
 */
export interface LiveSessionList {
  sessions: LiveSessionSummary[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StateResponse".
 */
export interface StateResponse {
  session: string;
  state: SessionView;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "snapshot".
 */
export interface Snapshot {
  v: ProtocolVersion;
  sessions: LiveSessionSummary[];
  rooms: {
    [k: string]: SessionView;
  };
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "session.removed".
 */
export interface SessionRemoved {
  v: ProtocolVersion;
  session: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CaptureBatchRequest".
 */
export interface CaptureBatchRequest {
  session_key: string;
  agent: string;
  channel?: string | null;
  title?: string | null;
  settings?: {
    [k: string]: unknown;
  } | null;
  task_id?: string | null;
  finalize?: boolean | null;
  created_at?: Millis | null;
  updated_at?: Millis | null;
  messages: CaptureMessage[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CaptureMessage".
 */
export interface CaptureMessage {
  event_id: string;
  role: Role;
  content: string;
  tool_name?: string | null;
  tool_args?: {
    [k: string]: unknown;
  } | null;
  tool_result?: string | null;
  metadata?: {
    [k: string]: unknown;
  } | null;
  created_at?: Millis | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CaptureResult".
 */
export interface CaptureResult {
  ok: boolean;
  conversation_id: string;
  inserted: number;
  skipped: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookContextBase".
 */
export interface HookContextBase {
  agentId?: string | null;
  sessionId?: string | null;
  timestamp: number;
  metadata: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookUsage".
 */
export interface HookUsage {
  promptTokens: number;
  completionTokens: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "SessionTokens".
 */
export interface SessionTokens {
  prompt: number;
  completion: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TurnComplexity".
 */
export interface TurnComplexity {
  toolCallCount: number;
  hadErrorRecovery: boolean;
  hadUserCorrection: boolean;
  uniqueTools: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "Message".
 */
export interface Message {
  role: Role;
  content: MessageContent;
  reasoning?: string | null;
  toolCalls?: ToolCall[] | null;
  toolCallId?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ToolCall".
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: {
    [k: string]: unknown;
  };
  thoughtSignature?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookPipelineError".
 */
export interface HookPipelineError {
  hookId: string;
  error: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookPipelineResult".
 */
export interface HookPipelineResult {
  context: HookContext;
  aborted: boolean;
  skipped: boolean;
  errors: HookPipelineError[];
  ran: string[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HookConfig".
 */
export interface HookConfig {
  id: string;
  event: HookEventName;
  type: HookConfigKind;
  target: string;
  priority?: number | null;
  onError?: HookErrorMode | null;
  agentFilter?: string[] | null;
  toolFilter?: string[] | null;
  description?: string | null;
  enabled?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ApprovalOption".
 */
export interface ApprovalOption {
  key: string;
  label: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessSessionSummary".
 */
export interface HarnessSessionSummary {
  sessionId: SessionId;
  harnessId: HarnessId;
  title?: string | null;
  cwd?: string | null;
  createdAt: Millis;
  updatedAt: Millis;
  status: HarnessSessionStatus;
  blocked?: boolean | null;
  supersedes?: SessionId | null;
  model?: string | null;
  parentSessionId?: SessionId | null;
  agentName?: string | null;
  taskId?: string | null;
  effort?: string | null;
  transport?: Transport | null;
  [k: string]: unknown;
}
export interface HarnessStatusFrame {
  type: "status";
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PromptQuestion".
 */
export interface PromptQuestion {
  question?: string | null;
  header?: string | null;
  multiSelect: boolean;
  freeText?: boolean | null;
  options: PromptOption[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PromptOption".
 */
export interface PromptOption {
  label: string;
  description?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PromptResolution".
 */
export interface PromptResolution {
  at: number;
  answerText?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "PromptScreen".
 */
export interface PromptScreen {
  current: number;
  total: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "StatusTool".
 */
export interface StatusTool {
  name: string;
  toolCallId?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessStatusFrame".
 */
export interface HarnessStatusFrame1 {
  sessionId: SessionId;
  status: HarnessStatus;
  since: number;
  source?: StatusSource | null;
  phase?: StatusPhase | null;
  tool?: StatusTool | null;
  promptId?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessCapabilities".
 */
export interface HarnessCapabilities {
  interrupt: boolean;
  resume: boolean;
  approvals: boolean;
  liveStream: boolean;
  listSessions: boolean;
  drive?: boolean | null;
  turnOptions?: boolean | null;
  launchModel?: boolean | null;
  imageAttachments?: boolean | null;
  models?: HarnessModelOption[] | null;
  modelsSource?: HarnessModelsSource | null;
  efforts?: EffortOption[] | null;
  modelFlag?: string | null;
  effortFlag?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessModelOption".
 */
export interface HarnessModelOption {
  inputModalities?: string[] | null;
  id: string;
  label: string;
  isDefault?: boolean | null;
  efforts?: EffortOption[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "EffortOption".
 */
export interface EffortOption {
  id: string;
  label: string;
  isDefault?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessControlCapabilities".
 */
export interface HarnessControlCapabilities {
  interrupt: boolean;
  resume: boolean;
  approvals: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessObservationCapabilities".
 */
export interface HarnessObservationCapabilities {
  liveStream: boolean;
  listSessions: boolean;
  drive?: boolean | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessSessionList".
 */
export interface HarnessSessionList {
  sessions: HarnessSessionSummary[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessOffering".
 */
export interface HarnessOffering {
  harnessId: HarnessId;
  chat: boolean;
  capabilities: HarnessCapabilities;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessOfferingList".
 */
export interface HarnessOfferingList {
  harnesses: HarnessOffering[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessStoreSession".
 */
export interface HarnessStoreSession {
  id: string;
  command: RosterCommand;
  title: string;
  updatedAt: number;
  parentSessionId?: string | null;
  agentName?: string | null;
  model?: string | null;
  taskId?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "HarnessStoreSessionList".
 */
export interface HarnessStoreSessionList {
  sessions: HarnessStoreSession[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ContextRef".
 */
export interface ContextRef {
  kind: ContextRefKind;
  ref: string;
  note?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "AcceptanceCriterion".
 */
export interface AcceptanceCriterion {
  id: string;
  description: string;
  kind: CriterionKind;
  check?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskBudget".
 */
export interface TaskBudget {
  maxUsd?: number | null;
  maxTokens?: number | null;
  maxTurns?: number | null;
  maxWallClockMs?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskUsage".
 */
export interface TaskUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd?: number | null;
  turns: number;
  wallClockMs: number;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskSpec".
 */
export interface TaskSpec {
  delegation?: boolean | null;
  meshFrom?: string | null;
  taskId: string;
  agentId: string;
  goal: string;
  resolvedContext: ContextRef[];
  acceptanceCriteria: AcceptanceCriterion[];
  budget: TaskBudget1;
  tools?: string[] | null;
  workingDir?: string | null;
  model?: string | null;
  effort?: Effort | null;
  systemPromptAppend?: string | null;
  isolation?: TaskIsolation | null;
  promptMode?: TaskPromptMode | null;
  excludeTools?: string[] | null;
  resumeMessage?: string | null;
  session: string;
  permissionDecisions?: TaskPermissionDecision[] | null;
  presetId?: string | null;
  presetName?: string | null;
  auditOnly?: boolean | null;
  [k: string]: unknown;
}
export interface TaskBudget1 {
  maxUsd?: number | null;
  maxTokens?: number | null;
  maxTurns?: number | null;
  maxWallClockMs?: number | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskPermissionDecision".
 */
export interface TaskPermissionDecision {
  requestId: string;
  tool: string;
  decision: TaskPermissionOutcome;
  at: number;
  message?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskArtifact".
 */
export interface TaskArtifact {
  kind: ArtifactKind;
  ref: string;
  note?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "CriterionReport".
 */
export interface CriterionReport {
  id: string;
  met: boolean;
  evidence: string;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskResult".
 */
export interface TaskResult {
  verdict: TaskVerdict;
  summary: string;
  output?: string | null;
  artifacts: TaskArtifact[];
  criteriaSelfReport?: CriterionReport[] | null;
  usage: TaskUsage;
  error?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "EvalOutcome".
 */
export interface EvalOutcome {
  verdict: EvalVerdict;
  attempts: number;
  verifierTaskIds: string[];
  criteriaReport: CriterionReport[];
  diverged: boolean;
  escalatedAt?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ExecutorTurnCapabilities".
 */
export interface ExecutorTurnCapabilities {
  steerable: boolean;
  multiTurn: boolean;
  structuredStream: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ExecutorResultCapabilities".
 */
export interface ExecutorResultCapabilities {
  usageInResult: boolean;
  sessionIdCapture: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "ExecutorInteractionCapabilities".
 */
export interface ExecutorInteractionCapabilities {
  slashCommands: boolean;
  effortSelection: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskApprovalRequest".
 */
export interface TaskApprovalRequest {
  taskId: string;
  requestId: string;
  name: string;
  input: {
    [k: string]: unknown;
  };
  toolCallId?: string | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskWire".
 */
export interface TaskWire {
  id: string;
  goal: string;
  contextRefs: ContextRef[];
  acceptanceCriteria: AcceptanceCriterion[];
  spec: TaskSpec;
  executor: TaskExecutorKind;
  executorTarget?: string | null;
  agentId: string;
  requestedBy?: string | null;
  origin: string;
  parentTaskId?: string | null;
  chainDepth: number;
  nodeAffinity?: string | null;
  claimedBy?: string | null;
  budget: TaskBudget;
  usage?: TaskUsage | null;
  status: TaskStatus;
  attempt: number;
  maxAttempts: number;
  pendingMessage?: string | null;
  error?: string | null;
  result?: TaskResult | null;
  conversationId?: string | null;
  sessionKey?: string | null;
  harnessSessionIds: string[];
  eval?: EvalOutcome | null;
  evalAttempt: number;
  createdAt: number;
  startedAt?: number | null;
  lastHeartbeatAt?: number | null;
  completedAt?: number | null;
  durationMs?: number | null;
  pendingApprovals?: TaskApprovalRequest[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskCreateRequest".
 */
export interface TaskCreateRequest {
  goal: string;
  agentId: string;
  executor?: TaskExecutorKind | null;
  executorTarget?: string | null;
  requestedBy?: string | null;
  parentTaskId?: string | null;
  chainDepth?: number | null;
  nodeAffinity?: string | null;
  spec?: TaskSpec | null;
  budget?: TaskBudget | null;
  contextRefs?: ContextRef[] | null;
  acceptanceCriteria?: AcceptanceCriterion[] | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskResponse".
 */
export interface TaskResponse {
  task: TaskWire;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TasksListResponse".
 */
export interface TasksListResponse {
  tasks: TaskWire[];
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskSteerAccepted".
 */
export interface TaskSteerAccepted {
  ok: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskKillResponse".
 */
export interface TaskKillResponse {
  ok: boolean;
  prior?: TaskStatus | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskApprovalAccepted".
 */
export interface TaskApprovalAccepted {
  ok: boolean;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskApprovalWaitResponse".
 */
export interface TaskApprovalWaitResponse {
  approval: TaskApprovalRequest;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskWaitTimeoutResponse".
 */
export interface TaskWaitTimeoutResponse {
  error: string;
  task?: TaskWire | null;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "TaskOverrides".
 */
export interface TaskOverrides {
  delegation?: boolean | null;
  meshFrom?: string | null;
  presetId?: string | null;
  presetName?: string | null;
  permissionDecisions?: TaskPermissionDecision[] | null;
  auditOnly?: boolean | null;
  workingDir?: string | null;
  model?: string | null;
  effort?: Effort | null;
  systemPromptAppend?: string | null;
  isolation?: TaskIsolation | null;
  promptMode?: TaskPromptMode | null;
  excludeTools?: string[] | null;
  resumeMessage?: string | null;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `RivetHubContractSentByTheRuntime`'s JSON-Schema
 * via the `definition` "MemorySearchResult".
 */
export interface MemorySearchResult {
  chunk?: MemoryChunkMatch | null;
  id: string;
  source: MemoryHitSource;
  content: string;
  role: Role | null;
  agent: string | null;
  relevanceScore: number;
  createdAt: string;
}
