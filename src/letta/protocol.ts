export interface LettaInput {
    type: "user_input";
    text: string;
}

export interface LettaInitEvent {
    type: "init";
    agent_id: string;
    model: string;
    tools: string[];
}

export interface LettaMessageEvent {
    type: "message";
    messageType: "reasoning_message" | "assistant_message" | "stop_reason" | "usage_statistics";
    content?: string;
    reasoning?: string;
    stopReason?: string;
    otid?: string;
    seqId?: number;
}

export interface LettaResultEvent {
    type: "result";
    subtype: "success" | "error";
    result: string;
    agent_id: string;
    duration_ms: number;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface SessionOptions {
    agentId?: string;
    model?: string;
    permissionMode?: "default" | "acceptEdits" | "plan" | "bypassPermissions";
}

export type LettaEvent = LettaInitEvent | LettaMessageEvent | LettaResultEvent | { type: string; [key: string]: any };
