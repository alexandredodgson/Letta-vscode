import { LettaEvent, LettaInitEvent, LettaMessageEvent, LettaResultEvent } from './protocol';

export interface EventHandlerCallbacks {
    onSessionReady: (event: LettaInitEvent) => void;
    onMessageDelta: (delta: string, messageId: string) => void;
    onMessageComplete: (content: string, messageId: string) => void;
    onTaskComplete: (event: LettaResultEvent) => void;
    onError: (message: string) => void;
    onRawEvent: (event: any) => void;
}

export class EventHandler {
    private currentMessageContent: string = '';
    private currentMessageId: string = '';

    constructor(private callbacks: EventHandlerCallbacks) {}

    public parseLine(line: string) {
        if (!line.trim()) return;

        try {
            const event: LettaEvent = JSON.parse(line);
            this.handleEvent(event);
        } catch (e) {
            console.error('Failed to parse Letta JSONL line:', line, e);
        }
    }

    private handleEvent(event: LettaEvent) {
        this.callbacks.onRawEvent(event);

        switch (event.type) {
            case 'init':
                const initEvent = event as LettaInitEvent;
                this.callbacks.onSessionReady(initEvent);
                break;

            case 'message':
                const msgEvent = event as LettaMessageEvent;
                const messageId = msgEvent.otid || 'default';

                if (msgEvent.messageType === 'assistant_message') {
                    const delta = msgEvent.content || '';
                    this.currentMessageContent += delta;
                    this.currentMessageId = messageId;
                    this.callbacks.onMessageDelta(delta, messageId);
                } else if (msgEvent.messageType === 'stop_reason') {
                    this.callbacks.onMessageComplete(this.currentMessageContent, this.currentMessageId);
                    this.currentMessageContent = '';
                    this.currentMessageId = '';
                }
                break;

            case 'result':
                this.callbacks.onTaskComplete(event as LettaResultEvent);
                break;
        }
    }
}
