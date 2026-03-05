# Letta Code VSCode Extension — Spécification technique (Module de base)

## 1. Portée

Module de base = socle fonctionnel avec **chat complet** (envoi, streaming, markdown, code blocks, stop). Premier livrable testable par la communauté.

---

## 2. Extension host (`src/`)

### 2.1 `extension.ts`

- `activate(context)` : instancie LettaService, ConfigManager, ChatProvider, StatusBarManager
- Connecte events LettaService → ChatProvider (pont)
- Enregistre commandes : `letta-code.focus`, `letta-code.restart`
- Keybinding : `Ctrl+Shift+L` → focus
- Activation : `onStartupFinished`

### 2.2 `letta/lettaService.ts`

```typescript
class LettaService extends EventEmitter {
  startSession(options?: SessionOptions): Promise<void>
  stopSession(): Promise<void>
  restartSession(): Promise<void>
  sendMessage(text: string): void   // écrit JSON sur stdin
  interrupt(): void                 // SIGINT au subprocess
  isReady(): boolean
}
```

**Spawn** : `spawn("letta", ["--output-format","stream-json","--input-format","stream-json", ...args])`

**stdin** (envoi) : `{"type":"user_input","text":"hello"}\n`

**stdout** (réception) : JSONL parsé ligne par ligne → `eventHandler`

**Events émis** :
- `session-ready` → `{ model, agentId, tools }`
- `session-closed` → `{ code }`
- `message-delta` → `{ delta, messageId }`
- `message-complete` → `{ content, messageId }`
- `error` → `{ message }`
- `raw-event` → événement JSONL brut (debug)

**Crash recovery** : 3 tentatives auto (délai 3s), puis notification VSCode.

**Détection CLI** : `execSync("letta --version")` au démarrage.

### 2.3 `letta/eventHandler.ts`

Parse JSONL, route vers events :

| Event Letta | Emit LettaService |
|---|---|
| `{ type: "init" }` | `session-ready` |
| `{ type: "message", messageType: "assistant_message" }` | `message-delta` |
| `{ type: "message", messageType: "reasoning_message" }` | `raw-event` |
| `{ type: "message", messageType: "stop_reason" }` | `message-complete` |
| `{ type: "message", messageType: "usage_statistics" }` | `raw-event` |
| `{ type: "result" }` | `task-complete` |
| Ligne invalide | log erreur, ne crash pas |
| Event inconnu | `raw-event` |

### 2.4 `letta/protocol.ts`

```typescript
interface LettaInput { type: "user_input"; text: string }

interface LettaInitEvent {
  type: "init"
  agent_id: string
  model: string
  tools: string[]
}

interface LettaMessageEvent {
  type: "message"
  messageType: "reasoning_message" | "assistant_message" | "stop_reason" | "usage_statistics"
  content?: string
  reasoning?: string
  stopReason?: string
  otid?: string
  seqId?: number
}

interface LettaResultEvent {
  type: "result"
  subtype: "success" | "error"
  result: string
  agent_id: string
  duration_ms: number
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

interface SessionOptions {
  agentId?: string
  model?: string
  permissionMode?: "default" | "acceptEdits" | "plan" | "bypassPermissions"
}
```

### 2.5 `letta/config.ts`

```typescript
interface LettaConfig {
  model: string           // default: "claude-sonnet-4.5"
  agentId?: string
  permissionMode: string  // default: "default"
}
```

Stockage : `context.globalState`. Méthodes : `getCliArgs()`, `getEnv()`.

### 2.6 `providers/chatProvider.ts`

Implémente `WebviewViewProvider`. Génère HTML shell + charge bundle React. CSP configurée. `retainContextWhenHidden: true`.

**Messages webview → extension** :
```
{ type: "ready" }                  → webview chargée
{ type: "sendMessage", text }      → message utilisateur
{ type: "interrupt" }              → stop streaming
```

**Messages extension → webview** :
```
{ type: "status", status, model?, error? }     → état session
{ type: "message-delta", delta, messageId }    → token streaming
{ type: "message-complete", content, messageId }→ message final
{ type: "clear" }                              → vider le chat
```

### 2.7 `providers/statusBar.ts`

`StatusBarItem` aligné gauche. Texte : `★ Letta: <model>`. Clic → `letta-code.focus`. Update sur `session-ready`.

---

## 3. Webview UI (`webview-ui/`)

### 3.1 Types

```typescript
type MessageRole = "user" | "assistant" | "system"
type SessionStatus = "initializing" | "connected" | "error" | "disconnected"

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  isStreaming?: boolean
}
```

### 3.2 `App.tsx` — State

```typescript
const [messages, setMessages] = useState<ChatMessage[]>([])
const [status, setStatus] = useState<SessionStatus>("initializing")
const [model, setModel] = useState("")
const [isTyping, setIsTyping] = useState(false)
```

- `status` → maj sur message `status`
- `message-delta` → créer ou append au message streaming
- `message-complete` → finaliser, `setIsTyping(false)`
- Envoi : optimistic UI (message user ajouté immédiatement)

### 3.3 Composants

**`ChatView.tsx`** — Layout flex vertical
- `messages.length === 0` → `<WelcomeScreen />`
- Sinon → `<MessageList />` (flex-1 scroll) + `<TypingIndicator />` + `<MessageInput />`

**`MessageList.tsx`** — Liste scrollable, auto-scroll vers le bas

**`Message.tsx`**
- User : fond `--vscode-input-background`, texte brut
- Assistant : markdown via `react-markdown` + `remark-gfm` + `react-syntax-highlighter`
- System : centré, italique
- `isStreaming` : curseur clignotant `▊`
- Code blocks : coloration + bouton "Copier" (absolute top-right)

**`MessageInput.tsx`**
- `<textarea>` auto-resize (max 8 lignes)
- Enter → envoyer, Shift+Enter → newline
- Bouton ⏎ / ■ (stop pendant streaming)
- Disabled si `status !== "connected"`

**`TypingIndicator.tsx`** — 3 points pulse CSS

**`WelcomeScreen.tsx`** — Icône + titre + modèle + 3 suggestions cliquables

### 3.4 Markdown

Dépendances : `react-markdown`, `remark-gfm`, `react-syntax-highlighter`

Composants custom :
- `code` block → `<SyntaxHighlighter>` + bouton copier (`navigator.clipboard.writeText`)
- `a` → liens ouverts via extension
- Styles : CSS custom properties VSCode pour adaptation thème

### 3.5 Styles

Tailwind pour layout. Couleurs via CSS custom properties VSCode :
```
--vscode-foreground, --vscode-editor-background, --vscode-input-background,
--vscode-panel-border, --vscode-descriptionForeground, --vscode-focusBorder,
--vscode-textLink-foreground, --vscode-textCodeBlock-background
```

---

## 4. Flux de données

```
User → Enter
  ↓
Webview: ajoute msg user (optimistic) + postMessage("sendMessage")
  ↓
ChatProvider → lettaService.sendMessage(text)
  ↓
LettaService: stdin ← JSON\n
  ↓
CLI Letta: stdout → JSONL (assistant_message × N, stop_reason, result)
  ↓
EventHandler: parse → LettaService.emit("message-delta" × N, "message-complete")
  ↓
ChatProvider → webview.postMessage("message-delta", "message-complete")
  ↓
Webview: tokens affichés progressivement → finalisé en markdown
```

---

## 5. Critères de validation

| # | Critère |
|---|---|
| 1 | Extension s'active sans erreur |
| 2 | Icône dans l'activity bar |
| 3 | Clic icône → panneau sidebar |
| 4 | Status bar affiche le modèle |
| 5 | Ctrl+Shift+L focus le panneau |
| 6 | CLI absent → notification claire |
| 7 | Welcome screen au 1er lancement |
| 8 | Taper message + Enter → envoi |
| 9 | Message user affiché |
| 10 | Réponse stream en temps réel |
| 11 | Markdown rendu (bold, listes, etc.) |
| 12 | Code blocks colorés |
| 13 | Bouton copier fonctionne |
| 14 | Bouton Stop interrompt |
| 15 | Auto-scroll sur longue réponse |
| 16 | Fonctionne dark ET light mode |
| 17 | Restart via command palette |
| 18 | Crash CLI géré proprement |
| 19 | `pnpm run build` OK |
| 20 | `pnpm run lint` OK |
| 21 | `pnpm run test` OK |
| 22 | `.vsix` packagé et installable |
