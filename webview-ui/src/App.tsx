import React, { useEffect, useState, useCallback } from 'react';
import { vscode } from './utils/vscode-api';
import { ChatMessage, SessionStatus } from './types/chat';
import { ChatView } from './components/ChatView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AlertCircle } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<SessionStatus>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [model, setModel] = useState("");

  const handleSendMessage = useCallback((text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);
    setError(null);
    vscode.postMessage({ type: 'sendMessage', text });
  }, []);

  const handleInterrupt = useCallback(() => {
    vscode.postMessage({ type: 'interrupt' });
  }, []);

  useEffect(() => {
    vscode.postMessage({ type: 'ready' });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case 'status':
          setStatus(message.status);
          if (message.model) setModel(message.model);
          if (message.error) {
            setError(message.error);
            setIsTyping(false);
          } else if (message.status === 'connected') {
            setError(null);
          }
          break;

        case 'message-delta':
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + message.delta }
              ];
            } else {
              return [
                ...prev,
                {
                  id: message.messageId || Date.now().toString(),
                  role: 'assistant',
                  content: message.delta,
                  timestamp: Date.now(),
                  isStreaming: true
                }
              ];
            }
          });
          break;

        case 'message-complete':
          setIsTyping(false);
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: message.content, isStreaming: false }
              ];
            }
            return prev;
          });
          break;

        case 'clear':
          setMessages([]);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="h-screen flex flex-col relative">
      {error && (
        <div className="bg-red-900/50 text-red-200 p-3 flex items-start gap-3 border-b border-red-800 animate-in slide-in-from-top duration-300 absolute top-0 left-0 right-0 z-50">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <div className="flex-1 text-sm">
            <p className="font-bold">Erreur Letta</p>
            <p className="opacity-90">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {messages.length === 0 && status !== 'error' ? (
        <WelcomeScreen model={model} onSuggestion={handleSendMessage} />
      ) : (
        <ChatView
          messages={messages}
          status={status}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onInterrupt={handleInterrupt}
        />
      )}
    </div>
  );
}

export default App;
