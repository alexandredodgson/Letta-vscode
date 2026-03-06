import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  onSuggestion: (text: string) => void;
  model: string;
}

export const WelcomeScreen: React.FC<Props> = ({ onSuggestion, model }) => {
  const suggestions = [
    "Explique-moi ce projet",
    "Quels fichiers dans ce workspace ?",
    "Aide-moi à corriger un bug"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[var(--vscode-editor-background)]">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded-xl">
        <Sparkles size={32} />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-[var(--vscode-foreground)]">Letta Code</h1>
      <p className="text-[var(--vscode-descriptionForeground)] mb-8">
        Modèle: <span className="font-mono">{model || 'Chargement...'}</span>
      </p>

      <div className="w-full max-w-sm space-y-3">
        {suggestions.map((text, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(text)}
            className="w-full p-3 text-left bg-[var(--vscode-input-background)] border border-[var(--vscode-panel-border)] rounded-md hover:border-[var(--vscode-focusBorder)] transition-colors text-sm"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};
