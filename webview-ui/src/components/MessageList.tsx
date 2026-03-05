import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types/chat';
import { Message } from './Message';

interface Props {
  messages: ChatMessage[];
}

export const MessageList: React.FC<Props> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto scroll-smooth py-4 bg-[var(--vscode-editor-background)]"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-[var(--vscode-descriptionForeground)] p-8 text-center italic">
          Commencez une conversation avec Letta...
        </div>
      ) : (
        messages.map((msg) => <Message key={msg.id} message={msg} />)
      )}
    </div>
  );
};
