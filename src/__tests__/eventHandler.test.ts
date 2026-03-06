import { describe, it, expect, vi } from 'vitest';
import { EventHandler, EventHandlerCallbacks } from '../letta/eventHandler';

describe('EventHandler', () => {
    it('should parse init event', () => {
        const callbacks: EventHandlerCallbacks = {
            onSessionReady: vi.fn(),
            onMessageDelta: vi.fn(),
            onMessageComplete: vi.fn(),
            onTaskComplete: vi.fn(),
            onError: vi.fn(),
            onRawEvent: vi.fn(),
        };

        const handler = new EventHandler(callbacks);
        const event = { type: 'init', agent_id: 'test-agent', model: 'test-model', tools: [] };

        handler.parseLine(JSON.stringify(event));

        expect(callbacks.onSessionReady).toHaveBeenCalledWith(event);
    });

    it('should handle message deltas and completion', () => {
        const callbacks: EventHandlerCallbacks = {
            onSessionReady: vi.fn(),
            onMessageDelta: vi.fn(),
            onMessageComplete: vi.fn(),
            onTaskComplete: vi.fn(),
            onError: vi.fn(),
            onRawEvent: vi.fn(),
        };

        const handler = new EventHandler(callbacks);
        const otid = 'test-otid';

        handler.parseLine(JSON.stringify({
            type: 'message',
            messageType: 'assistant_message',
            content: 'Hello',
            otid
        }));

        handler.parseLine(JSON.stringify({
            type: 'message',
            messageType: 'assistant_message',
            content: ' world',
            otid
        }));

        expect(callbacks.onMessageDelta).toHaveBeenCalledWith('Hello', otid);
        expect(callbacks.onMessageDelta).toHaveBeenCalledWith(' world', otid);

        handler.parseLine(JSON.stringify({
            type: 'message',
            messageType: 'stop_reason',
            otid
        }));

        expect(callbacks.onMessageComplete).toHaveBeenCalledWith('Hello world', otid);
    });
});
