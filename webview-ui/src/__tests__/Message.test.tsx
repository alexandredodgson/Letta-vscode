import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Message } from '../components/Message';
import { ChatMessage } from '../types/chat';

// Mock Markdown component as it uses complex dependencies
vi.mock('../utils/markdown', () => ({
  Markdown: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>
}));

describe('Message Component', () => {
  it('renders user message', () => {
    const msg: ChatMessage = {
      id: '1',
      role: 'user',
      content: 'Hello Letta',
      timestamp: Date.now()
    };
    render(<Message message={msg} />);
    expect(screen.getByText('Hello Letta')).toBeDefined();
  });

  it('renders assistant message via Markdown', () => {
    const msg: ChatMessage = {
      id: '2',
      role: 'assistant',
      content: '**Bold** text',
      timestamp: Date.now()
    };
    render(<Message message={msg} />);
    expect(screen.getByTestId('markdown')).toBeDefined();
    expect(screen.getByText('**Bold** text')).toBeDefined();
  });

  it('renders system message', () => {
    const msg: ChatMessage = {
      id: '3',
      role: 'system',
      content: 'System info',
      timestamp: Date.now()
    };
    render(<Message message={msg} />);
    expect(screen.getByText('System info')).toBeDefined();
  });
});
