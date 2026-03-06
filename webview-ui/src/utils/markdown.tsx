import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-md overflow-hidden my-4 border border-[var(--vscode-panel-border)]">
      <div className="flex items-center justify-between px-4 py-1 bg-[var(--vscode-editor-background)] text-xs text-[var(--vscode-descriptionForeground)] border-b border-[var(--vscode-panel-border)]">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-[var(--vscode-foreground)] transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export const Markdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm max-w-none prose-invert"
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <CodeBlock
              language={match[1]}
              value={String(children).replace(/\n$/, '')}
            />
          ) : (
            <code className="bg-[var(--vscode-textCodeBlock-background)] px-1 rounded" {...props}>
              {children}
            </code>
          );
        },
        a({ children, href }) {
            return (
                <a href={href} className="text-[var(--vscode-textLink-foreground)] hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            );
        },
        p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
        },
        ul({ children }) {
            return <ul className="list-disc ml-4 mb-2">{children}</ul>;
        },
        ol({ children }) {
            return <ol className="list-decimal ml-4 mb-2">{children}</ol>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
