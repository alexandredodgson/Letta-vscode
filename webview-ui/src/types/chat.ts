export type MessageRole = "user" | "assistant" | "system"
export type SessionStatus = "initializing" | "connected" | "error" | "disconnected"

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  isStreaming?: boolean
}
