# Letta Code VSCode Extension

Interact with Letta agents directly from your VS Code sidebar. Letta agents have persistent memory and can execute tools on your local machine.

## Features

- **Persistent Memory**: Your agent remembers previous conversations and context.
- **Multi-model Support**: Use Claude, GPT, or other supported models.
- **Local Tool Execution**: Agents can perform tasks in your workspace.
- **Streaming UI**: Real-time response generation.
- **Markdown & Code**: Full rendering for code blocks and formatted text.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Letta Code CLI](https://github.com/letta-ai/letta-code): `npm install -g @letta-ai/letta-code`

## Getting Started

1. Install the extension.
2. Open the Letta view from the Activity Bar (sparkle icon).
3. If not already configured, ensure you have a Letta API key or local session running.
4. Start chatting!

## Commands

- `Letta: Focus Chat`: Open and focus the Letta sidebar.
- `Letta: Restart Session`: Force a restart of the current Letta session.

## Configuration

Available in VS Code settings under `Letta Code`:
- `model`: The model to use for the agent.
- `permissionMode`: How permissions for tool execution are handled.

## Development

```bash
pnpm install
pnpm run build
# Open in VS Code and press F5
```

## License

Apache 2.0
