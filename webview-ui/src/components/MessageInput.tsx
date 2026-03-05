import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

interface Props {
  onSendMessage: (text: string) => void;
  onInterrupt: () => void;
  disabled: boolean;
  isTyping: boolean;
}

export const MessageInput: React.FC<Props> = ({ onSendMessage, onInterrupt, disabled, isTyping }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim() && !disabled && !isTyping) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-[var(--vscode-panel-border)]">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Envoyez un message à Letta..."
        disabled={disabled}
        className="flex-1 bg-[var(--vscode-input-background)] text-[var(--vscode-foreground)] border border-[var(--vscode-focusBorder)] rounded-md p-2 focus:outline-none resize-none max-h-[200px]"
      />
      {isTyping ? (
        <button
          onClick={onInterrupt}
          className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          title="Stop generating"
        >
          <Square size={20} fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="p-2 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded-md hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50 transition-colors"
        >
          <Send size={20} />
        </button>
      )}
    </div>
  );
};
