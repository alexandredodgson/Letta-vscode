# CLAUDE.md — Directives pour agents de code

> Ce fichier est lu automatiquement par Claude Code, Cursor, Copilot et tout agent qui travaille sur ce dépôt. Il définit le contexte, les règles et les références du projet.

---

## Projet

**Nom** : `letta-code-vscode`
**Description** : Extension VSCode open-source offrant un chat sidebar pour interagir avec les agents Letta Code — avec mémoire persistante, multi-modèle, et gestion des outils.
**Licence** : Apache 2.0
**Statut** : Développement actif — module de base

### Objectif

Créer la première extension VSCode pour Letta Code. L'extension permet de converser avec un agent Letta stateful directement dans un sidebar VSCode. L'agent est multi-modèle (Claude, GPT, Gemini, etc.), conserve sa mémoire entre les sessions, et peut exécuter des outils sur la machine locale.

### Différenciateur

Par rapport à Copilot Chat, Claude Code ou Cursor : **agent stateful avec mémoire persistante qui apprend entre les sessions**, open-source, et multi-modèle.

---

## Stack technique

| Composant | Technologie |
|---|---|
| Langage | TypeScript (strict mode) |
| Runtime extension | Node.js (API VSCode) |
| Runtime webview | React 19 + Tailwind CSS |
| Build extension | tsc (types) + esbuild (bundling) |
| Build webview | Vite |
| Package manager | pnpm |
| Communication CLI | Spawn subprocess + protocole JSONL (`--output-format stream-json`) |
| Rendu markdown | react-markdown + react-syntax-highlighter |
| Tests | Vitest (unitaires) + @vscode/test-electron (e2e) |
| Linter | ESLint |
| CI | GitHub Actions |

---

## Architecture

```
letta-code-vscode/
├── src/                         # Extension host (Node.js)
│   ├── extension.ts             # Point d'entrée activate/deactivate
│   ├── letta/
│   │   ├── lettaService.ts      # Wrapper CLI (spawn, stream, events)
│   │   ├── eventHandler.ts      # Parse événements JSONL Letta
│   │   ├── protocol.ts          # Types du protocole stream-json
│   │   └── config.ts            # Configuration (modèle, agent, mode)
│   ├── providers/
│   │   ├── chatProvider.ts      # Webview provider (extension ↔ webview)
│   │   └── statusBar.ts         # Status bar items
│   └── utils/
│       └── helpers.ts
├── webview-ui/                  # Frontend React (compilé par Vite)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ChatView.tsx     # Vue chat (messages + input)
│   │   │   ├── Message.tsx      # Rendu message (markdown + code)
│   │   │   ├── MessageInput.tsx # Zone de saisie
│   │   │   └── StatusBanner.tsx # Bandeau état connexion
│   │   ├── hooks/
│   │   │   └── useMessages.ts   # Hook gestion messages + streaming
│   │   └── utils/
│   │       ├── vscode-api.ts    # Communication avec l'extension
│   │       └── types.ts         # Types partagés
│   ├── vite.config.ts
│   └── tailwind.config.js
├── assets/icon.svg
├── package.json                 # Contribution points VSCode
└── tsconfig.json
```

### Flux de données

```
User input → [Webview] postMessage("sendMessage")
          → [ChatProvider] reçoit, appelle lettaService.sendMessage()
          → [LettaService] écrit JSONL sur stdin du CLI
          → [CLI Letta] stream la réponse sur stdout (JSONL)
          → [EventHandler] parse chaque ligne
          → [LettaService] émet events (message-delta, message-complete)
          → [ChatProvider] forward à la webview via postMessage
          → [Webview] useMessages() met à jour l'état React
          → [ChatView/Message] re-render avec streaming
```

---

## Documents de référence

### ⚠️ TOUJOURS consulter ces documents avant de coder

1. **`02-specification-module-base.md`** — Spécification technique complète
   - Types et interfaces exacts de chaque composant
   - Protocole de communication (messages extension ↔ webview)
   - Protocole stream-json du CLI Letta (events stdin/stdout)
   - Contribution points du `package.json`
   - 22 critères de validation

2. **`03-plan-execution-module-base.md`** — Plan d'exécution étape par étape
   - 10 étapes (0 à 9), chacune avec pre-check → tâches → tests → validation
   - **Ne jamais passer à l'étape N+1 si l'étape N n'est pas validée**
   - Chaque tâche est atomique et a des critères de validation clairs
   - Les tests (unitaires + intégration) sont définis pour chaque étape
   - Contient le code de référence pour les composants clés

### Comment utiliser ces documents

- **Pour savoir QUOI construire** → lire la spec (`02-specification-module-base.md`)
- **Pour savoir COMMENT et DANS QUEL ORDRE** → suivre le plan (`03-plan-execution-module-base.md`)
- **Pour valider une étape** → vérifier les critères de validation du plan avant de passer à la suivante
- **Pour ajouter une feature** → utiliser le template en fin du plan (section "Template pour les features suivantes")

---

## Dépôts de référence

| Dépôt | Usage |
|---|---|
| [milisp/codexia-vscode](https://github.com/milisp/codexia-vscode) | **Modèle structurel** — s'inspirer de l'architecture 4 couches, du pattern spawn CLI, du message passing webview ↔ extension |
| [letta-ai/letta-code](https://github.com/letta-ai/letta-code) | **CLI cible** — protocole stream-json, tools schemas, system prompts, code source du CLI qu'on wrappe |
| [letta-ai/letta-code-sdk](https://github.com/letta-ai/letta-code-sdk) | **Référence SDK** — voir `transport.ts` pour le pattern de spawn et communication JSONL |
| [letta-ai/letta-cowork](https://github.com/letta-ai/letta-cowork) | **GUI de référence** — app Electron sur le SDK, voir `src/electron/libs/runner.ts` et `src/ui/` |

---

## Règles de développement

### Conventions de code

- TypeScript strict mode (`strict: true` dans tsconfig)
- Nommage : camelCase pour les variables/fonctions, PascalCase pour les types/classes/composants
- Fichiers : camelCase pour les modules (`lettaService.ts`), PascalCase pour les composants React (`ChatView.tsx`)
- Imports : pas de chemins relatifs complexes (max 2 niveaux `../../`)
- Pas de `any` sauf dans les types de message passing (webview ↔ extension) — ces messages sont typés séparément dans `protocol.ts` et `types.ts`

### Build

```bash
pnpm install                # installer les dépendances (racine)
cd webview-ui && pnpm install  # installer les dépendances webview
pnpm run compile            # compiler l'extension (tsc)
pnpm run build-webview      # compiler la webview (vite)
pnpm run build              # compiler tout
pnpm run watch              # mode watch (extension)
pnpm run lint               # linter
pnpm run test               # tests
pnpm run package            # générer le .vsix
```

### Lancement en développement

1. Ouvrir le dossier dans VSCode
2. F5 → lance l'Extension Development Host
3. Pour la webview en hot-reload : `cd webview-ui && pnpm run dev` (optionnel)

### Tests

- Tests unitaires dans `src/**/__tests__/` et `webview-ui/src/**/__tests__/`
- Runner : Vitest
- Nommer les fichiers `*.test.ts` ou `*.test.tsx`
- Chaque module clé a ses tests : `eventHandler.test.ts`, `config.test.ts`, `useMessages.test.ts`, `Message.test.tsx`, `MessageInput.test.tsx`

### Gestion du CLI Letta

- Le CLI est spawné en subprocess avec `child_process.spawn`
- Communication : JSONL sur stdin/stdout (`--output-format stream-json --input-format stream-json`)
- Le CLI doit être installé globalement : `npm install -g @letta-ai/letta-code`
- L'extension détecte l'absence du CLI et affiche une notification claire
- Crash recovery : 3 tentatives de restart automatique, puis notification d'erreur

### Ce qu'il ne faut PAS faire

- Ne pas utiliser le SDK `@letta-ai/letta-code-sdk` directement — on spawn le CLI nous-mêmes pour garder le contrôle
- Ne pas utiliser `express`, `ws`, ou d'autres serveurs — la communication passe par le message passing VSCode
- Ne pas écrire de CSS vanilla — utiliser Tailwind + variables CSS VSCode (`var(--vscode-*)`)
- Ne pas casser la rétrocompatibilité du protocole webview ↔ extension sans mettre à jour les deux côtés
- Ne pas passer à l'étape suivante du plan sans que tous les critères de validation soient remplis

---

## Prérequis pour contribuer

- Node.js ≥ 18
- pnpm
- VSCode ≥ 1.103.0
- CLI Letta Code : `npm install -g @letta-ai/letta-code`
- Compte Letta (app.letta.com) ou variable `LETTA_API_KEY`
