export type SenderRole = "CUSTOMER" | "CREW" | "SYSTEM";
export type MessageDirection = "inbound" | "outbound";
export type MessageType = "text" | "voice" | "image" | "location" | "system";

export interface Message {
  id: string;
  jobId: string;
  senderRole: SenderRole;
  direction: MessageDirection;
  messageType: MessageType;
  content: string | null;
  mediaUrl: string | null;
  providerMessageSid: string | null;
  createdAt: string;
}

export type AgentEventStatus = "success" | "failure" | "pending";

export interface AgentEvent {
  id: string;
  jobId: string | null;
  eventType: string;
  tool: string | null;
  status: AgentEventStatus;
  inputSummary: string | null;
  outputSummary: string | null;
  createdAt: string;
}
