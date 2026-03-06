import React from 'react';
import { ChatMessage } from '../types/chat';
import { Markdown } from '../utils/markdown';

interface Props {
  message: ChatMessage;
}

export const Message: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-sm italic text-[var(--vscode-descriptionForeground)] bg-[var(--vscode-badge-background)] px-2 py-1 rounded">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div
        className={`max-w-[85%] rounded-lg p-3 ${
          isUser
            ? 'bg-[var(--vscode-input-background)] text-[var(--vscode-foreground)] border border-[var(--vscode-focusBorder)]'
            : 'bg-[var(--vscode-editor-background)] text-[var(--vscode-foreground)]'
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
          {isUser ? (
            message.content
          ) : (
            <Markdown content={message.content} />
          )}
          {message.isStreaming && <span className="inline-block w-2 h-4 bg-[var(--vscode-foreground)] ml-1 animate-pulse" />}
        </div>
      </div>
    </div>
  );
};
