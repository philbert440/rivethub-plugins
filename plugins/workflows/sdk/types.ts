import type { Accepted, Sent } from '@rivethub/contract'

export type { Accepted, Sent }

export type PluginManifest = Accepted.PluginManifest
export type View = Accepted.View
export type ViewBlock = Accepted.ViewBlock
export type ViewInline = Accepted.ViewInline
export type ViewButton = Accepted.ViewButton
export type ViewField = Accepted.ViewField
export type ViewAction = Accepted.ViewAction
export type ViewValue = Accepted.ViewValue
export type CanvasScene = Accepted.CanvasScene
export type CanvasItem = Accepted.CanvasItem
export type CanvasShape = Accepted.CanvasShape
export type CanvasOp = Accepted.CanvasOp
export type CanvasResponse = Accepted.CanvasResponse
export type PluginToolResult = Accepted.PluginToolResult
export type PluginJobResult = Accepted.PluginJobResult
export type PluginNotify = Accepted.PluginNotify

export type ViewRequest = Sent.ViewRequest
export type ViewActionRequest = Sent.ViewActionRequest
export type CanvasEventRequest = Sent.CanvasEventRequest
export type CanvasEvent = Sent.CanvasEvent
export type PluginToolCall = Sent.PluginToolCall
export type PluginEventDelivery = Sent.PluginEventDelivery
export type PluginEvent = Sent.PluginEvent
export type PluginJobRequest = Sent.PluginJobRequest
export type PluginSelf = Sent.PluginSelf
export type GatewayError = Sent.GatewayError
export type Settings = PluginSelf['settings']
