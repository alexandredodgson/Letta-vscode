import React from 'react';
import { ChatMessage, SessionStatus } from '../types/chat';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';

interface Props {
  messages: ChatMessage[];
  status: SessionStatus;
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onInterrupt: () => void;
}

export const ChatView: React.FC<Props> = ({ messages, status, isTyping, onSendMessage, onInterrupt }) => {
  return (
    <div className="flex flex-col h-screen bg-[var(--vscode-editor-background)] text-[var(--vscode-foreground)]">
      <MessageList messages={messages} />
      {isTyping && <TypingIndicator />}
      <MessageInput
        onSendMessage={onSendMessage}
        onInterrupt={onInterrupt}
        disabled={status !== 'connected'}
        isTyping={isTyping}
      />
    </div>
  );
};
