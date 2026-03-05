# Letta Code VSCode Extension — Résumé du projet

## Identité

| Champ | Valeur |
|---|---|
| **Nom** | `letta-code-vscode` |
| **Nom marketplace** | Letta Code for VSCode |
| **Description** | Extension VSCode open-source : chat sidebar pour les agents Letta Code — mémoire persistante, multi-modèle, gestion des outils. |
| **Licence** | Apache 2.0 |
| **Contribution** | Projet communautaire, destiné à être proposé à letta-ai |

---

## Objectif

Première extension VSCode pour Letta Code. S'appuie sur le CLI `@letta-ai/letta-code` via spawn direct (protocole stream-json).

Différenciateur vs Copilot/Claude Code : **agent stateful avec mémoire persistante**, open-source, multi-modèle.

---

## Stack technique

| Composant | Technologie |
|---|---|
| Langage | TypeScript |
| Extension | Node.js + API VSCode |
| Webview | React 19 + Tailwind CSS |
| Build extension | esbuild + tsc |
| Build webview | Vite |
| Package manager | pnpm |
| Communication CLI | `child_process.spawn` + JSONL |
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |
| Tests | Vitest + @vscode/test-electron |
| CI | GitHub Actions |

---

## Dépôts de référence

| Dépôt | Rôle |
|---|---|
| [milisp/codexia-vscode](https://github.com/milisp/codexia-vscode) | Modèle structurel (architecture, pattern spawn CLI, webview React) |
| [letta-ai/letta-code](https://github.com/letta-ai/letta-code) | CLI cible (protocole stream-json, tools, prompts) |
| [letta-ai/letta-code-sdk](https://github.com/letta-ai/letta-code-sdk) | Référence SDK (types, transport, session lifecycle) |
| [letta-ai/letta-cowork](https://github.com/letta-ai/letta-cowork) | Preuve de concept GUI (Electron + SDK) |

---

## Architecture

```
letta-code-vscode/
├── src/                         # Extension host (Node.js)
│   ├── extension.ts
│   ├── letta/
│   │   ├── lettaService.ts      # Spawn CLI, EventEmitter
│   │   ├── eventHandler.ts      # Parse JSONL
│   │   ├── protocol.ts          # Types stream-json
│   │   └── config.ts            # Config (modèle, agent, mode)
│   ├── providers/
│   │   ├── chatProvider.ts      # WebviewViewProvider
│   │   └── statusBar.ts
│   └── utils/
├── webview-ui/                  # Frontend React
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/chat/     # ChatView, Message, MessageInput...
│   │   ├── types/
│   │   └── utils/               # vscode-api, markdown
│   ├── vite.config.ts
│   └── tailwind.config.js
└── package.json                 # Contribution points VSCode
```

---

## Périmètre du module de base

Premier livrable fonctionnel :

- Extension activée avec icône dans l'activity bar
- **Chat complet** : envoi, streaming, markdown, coloration syntaxique, copier, stop
- Welcome screen avec suggestions cliquables
- LettaService : spawn CLI, JSONL, events
- Status bar avec modèle actif
- Gestion d'erreurs : CLI absent, crash recovery, restart
- CI, tests, packaging `.vsix`

---

## Prérequis utilisateur

- Node.js ≥ 18, VSCode ≥ 1.103.0
- CLI : `npm install -g @letta-ai/letta-code`
- Compte Letta ou LETTA_API_KEY
