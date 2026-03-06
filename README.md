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

## Installation dans VS Code (Usage local / Développeur)

Si vous souhaitez installer l'extension manuellement à partir des sources :

1.  **Prérequis** : Assurez-vous d'avoir `node`, `pnpm` et le CLI `letta` installés (`npm install -g @letta-ai/letta-code`).
2.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/votre-org/letta-code-vscode.git
    cd letta-code-vscode
    ```
3.  **Installer les dépendances** :
    ```bash
    pnpm install
    cd webview-ui && pnpm install && cd ..
    ```
4.  **Compiler l'extension** :
    ```bash
    pnpm run build
    ```
5.  **Installer dans VS Code** :
    -   Option A (Développement) : Ouvrez le dossier dans VS Code et appuyez sur **F5**.
    -   Option B (VSIX) :
        1.  Générez le package : `pnpm vsce package --no-dependencies`.
        2.  Dans VS Code, ouvrez la vue Extensions (`Ctrl+Shift+X`).
        3.  Cliquez sur les trois points (`...`) en haut à droite.
        4.  Choisissez **Install from VSIX...** et sélectionnez le fichier `.vsix` généré.
