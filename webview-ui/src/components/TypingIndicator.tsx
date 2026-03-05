import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4 px-4">
      <div className="max-w-[85%] rounded-lg p-3 bg-[var(--vscode-editor-background)] text-[var(--vscode-foreground)] flex items-center gap-1 h-10">
        <span className="w-1.5 h-1.5 bg-[var(--vscode-foreground)] opacity-50 rounded-full animate-bounce delay-0" />
        <span className="w-1.5 h-1.5 bg-[var(--vscode-foreground)] opacity-50 rounded-full animate-bounce delay-150" />
        <span className="w-1.5 h-1.5 bg-[var(--vscode-foreground)] opacity-50 rounded-full animate-bounce delay-300" />
      </div>
    </div>
  );
};
