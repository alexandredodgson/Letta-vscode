# Letta Code VSCode Extension — Plan d'exécution (Module de base)

## Méthodologie

Chaque étape suit ce cycle :

```
1. PRE-CHECK   → vérifier les prérequis
2. CODE        → implémenter les tâches atomiques
3. TEST        → écrire et exécuter les tests
4. VALIDATION  → critères remplis ? ✅ → étape suivante | ❌ → corriger
```

**Règle : ne jamais passer à l'étape N+1 si N n'est pas validée.**

---

## Étape 0 — Scaffolding

### Pre-check
 - [x] Node.js ≥ 18, pnpm, VSCode, Git installés
 - [x] Dépôt GitHub créé (vide)

### Tâches
- **0.1** Initialiser le dépôt (`git init`, `pnpm init`)
- **0.2** Créer la structure de dossiers :
  ```
  mkdir -p src/letta src/providers src/utils
  mkdir -p webview-ui/src/components/chat webview-ui/src/utils webview-ui/src/types
  mkdir -p assets .github/workflows
  ```
- **0.3** `package.json` racine avec contribution points (voir spec §5)
- **0.4** `tsconfig.json` (module commonjs, target ES2022, strict)
- **0.5** Fichiers projet : `.gitignore`, `.vscodeignore`, `LICENSE` (Apache 2.0), `README.md`, `CONTRIBUTING.md`
- **0.6** Initialiser webview : `cd webview-ui && pnpm create vite . --template react-ts`, ajouter tailwindcss, configurer `vite.config.ts` (output → `../out/webview-ui/`, single bundle)
- **0.7** Icône placeholder `assets/icon.svg`

### Validation
- [x] `pnpm install` OK (racine + webview-ui)
 - [x] Structure conforme
 - [x] Commit initial + push GitHub

---

## Étape 1 — Extension minimale

### Pre-check
 - [x] Étape 0 validée

### Tâches
- **1.1** `src/extension.ts` : `activate()` avec `console.log`, `deactivate()` vide
- **1.2** `.vscode/launch.json` pour F5 (Extension Development Host)
- **1.3** `.vscode/tasks.json` pour la tâche compile

### Test
- [x] `pnpm run compile` OK
- [x] F5 → fenêtre dev host s'ouvre
 - [x] "Letta Code extension activated" dans la console

### Validation
 - [x] Extension s'active sans erreur ni warning

---

## Étape 2 — Webview dans le sidebar

### Pre-check
 - [x] Étape 1 validée

### Tâches
- **2.1** `src/providers/chatProvider.ts` : implémenter `WebviewViewProvider`
  - `resolveWebviewView()` : configure webview, charge HTML
  - `_getHtmlForWebview()` : shell HTML avec CSP, charge le bundle React
  - `enableScripts: true`, `retainContextWhenHidden: true`
- **2.2** Webview minimale :
  - `webview-ui/src/main.tsx` : mount React
  - `webview-ui/src/App.tsx` : affiche "Letta Code — Chargement..."
  - `webview-ui/src/index.css` : import Tailwind
- **2.3** Configurer Vite : output `../out/webview-ui/`, single bundle, base `./`
- **2.4** Enregistrer le provider dans `extension.ts`

### Test
- [x] `pnpm run build-webview` OK
- [x] F5 → icône dans activity bar
 - [x] Clic → panneau sidebar avec "Letta Code — Chargement..."
 - [x] Pas d'erreur CSP dans la console webview

### Validation
 - [x] Webview s'affiche, thème respecté (dark/light)
 - [x] Panneau survit au hide/show

---

## Étape 3 — Communication bidirectionnelle

### Pre-check
 - [x] Étape 2 validée

### Tâches
- **3.1** `webview-ui/src/utils/vscode-api.ts` : `postMessage()`, `onMessage()`
- **3.2** `App.tsx` : au mount, envoyer `{ type: "ready" }`, écouter les réponses, afficher l'état
- **3.3** `chatProvider.ts` : écouter `ready` → répondre `{ type: "status", status: "connected" }`
- **3.4** Ajouter `postToWebview(message)` dans ChatProvider
- **3.5** Test ping-pong : bouton temporaire dans la webview, vérifier aller-retour

### Test
- [ ] Webview envoie "ready" → extension répond "status connected"
- [ ] Webview passe de "Chargement..." à "Connecté"
- [ ] Ping-pong fonctionnel (retirer le bouton test après)

### Validation
- [ ] Communication bidirectionnelle fiable

---

## Étape 4 — LettaService (wrapper CLI)

### Pre-check
- [ ] Étape 3 validée
- [ ] CLI Letta installé (`letta --version`)
- [ ] LETTA_API_KEY configuré

### Tâches
- **4.1** `src/letta/protocol.ts` : tous les types (voir spec §2.4)
- **4.2** `src/letta/eventHandler.ts` : parse JSONL, route vers events (voir spec §2.3)
- **4.3** `src/letta/config.ts` : ConfigManager avec globalState, `getCliArgs()`, `getEnv()`
- **4.4** `src/letta/lettaService.ts` :
  - `startSession()` : vérifier CLI → construire args → spawn → écouter stdout/stderr/close/error → parser via eventHandler → attendre `init` → emit `session-ready` → timeout 15s
  - `sendMessage(text)` : JSON.stringify sur stdin
  - `interrupt()` : `process.kill("SIGINT")`
  - `stopSession()` : kill propre
  - `restartSession()` : stop + start
  - Buffer stdout pour gérer les lignes incomplètes
- **4.5** `isLettaCliInstalled()` : utilitaire avec `execSync`
- **4.6** Intégrer dans `extension.ts` : instancier, démarrer, logger les events

### Tests unitaires
- **4.T1** `eventHandler.test.ts` :
  - Parse event `init` valide → objet typé correct
  - Parse event `message/assistant_message` → contenu extrait
  - Parse event `result` → résultat extrait
  - JSON invalide → log erreur, pas de crash
  - Ligne vide → ignorée
- **4.T2** `lettaService.test.ts` (avec mock du subprocess) :
  - `startSession()` émet "session-ready" sur event init
  - `sendMessage()` écrit le JSON sur stdin
  - `stopSession()` kill le process
  - CLI absent → rejet avec message clair
  - Timeout → rejet avec erreur

### Validation
- [ ] LettaService démarre le CLI
- [ ] Event "session-ready" émis avec model et agentId
- [ ] `sendMessage()` écrit sur stdin
- [ ] Events du CLI arrivent dans l'extension
- [ ] CLI absent → notification propre
- [ ] Tous les tests passent

---

## Étape 5 — Chat UI : composants de base + câblage

### Pre-check
- [ ] Étape 4 validée
- [ ] LettaService reçoit des events

### Tâches
- **5.1** `webview-ui/src/types/chat.ts` : types ChatMessage, SessionStatus
- **5.2** `MessageInput.tsx` :
  - `<textarea>` auto-resize (max 8 lignes)
  - Enter → envoyer, Shift+Enter → newline
  - Bouton ⏎ (envoyer) / ■ (stop pendant streaming)
  - Disabled si `status !== "connected"`
  - Placeholder : "Envoyez un message à Letta..."
- **5.3** `Message.tsx` :
  - User : fond `--vscode-input-background`, texte brut
  - Assistant : texte brut pour l'instant (markdown = étape 6)
  - System : centré, italique
  - `isStreaming` → curseur `▊` clignotant
- **5.4** `MessageList.tsx` : liste scrollable, auto-scroll en bas
- **5.5** `TypingIndicator.tsx` : 3 points pulse CSS
- **5.6** `ChatView.tsx` : layout flex, MessageList + TypingIndicator + MessageInput
- **5.7** `App.tsx` : state management complet
  - State : messages, status, model, isTyping
  - Handlers messages extension : status, message-delta, message-complete
  - Handler envoi : optimistic UI (message user immédiat), postMessage, setIsTyping
- **5.8** Câblage dans `chatProvider.ts` :
  - `sendMessage` de webview → `lettaService.sendMessage()`
  - `interrupt` de webview → `lettaService.interrupt()`
  - Events LettaService → `postToWebview()`
- **5.9** Câblage dans `extension.ts` : connecter lettaService events → chatProvider

### Test
- [ ] Taper "hello" + Enter → message user apparaît
- [ ] Typing indicator pendant la réponse
- [ ] Tokens arrivent un par un (streaming visible)
- [ ] Message complet affiché après le streaming
- [ ] Bouton Stop interrompt la génération
- [ ] Shift+Enter → newline, pas d'envoi
- [ ] Input disabled quand pas connecté
- [ ] Scroll suit les nouveaux messages

### Validation
- [ ] Échange complet question → réponse fonctionne
- [ ] Streaming fluide
- [ ] Interruption fonctionne
- [ ] Pas de fuite mémoire (listeners nettoyés)

---

## Étape 6 — Rendu markdown et code blocks

### Pre-check
- [ ] Étape 5 validée (chat basique texte brut fonctionne)

### Tâches
- **6.1** Installer dépendances : `pnpm add react-markdown remark-gfm react-syntax-highlighter @types/react-syntax-highlighter`
- **6.2** `utils/markdown.tsx` : wrapper react-markdown avec composants custom
  - Code inline → `<code>`
  - Code block → `<SyntaxHighlighter>` + bouton "Copier"
  - Liens → ouverts via extension
- **6.3** Bouton "Copier" : `navigator.clipboard.writeText()`, feedback "✓ Copié" pendant 2s
- **6.4** Intégrer dans `Message.tsx` : messages assistant rendus en markdown
- **6.5** Styles CSS : code blocks, tables, listes, liens adaptés au thème VSCode

### Test
- [ ] `**bold**` → gras
- [ ] `` `inline` `` → code inline
- [ ] ` ```python ... ``` ` → coloration Python
- [ ] Bouton copier → copie dans le presse-papier
- [ ] Tables markdown OK
- [ ] Listes indentées OK
- [ ] Liens cliquables
- [ ] Pas d'erreur sur markdown mal formé

### Validation
- [ ] Markdown rendu correctement
- [ ] Lisible en dark ET light mode
- [ ] Copier fonctionne
- [ ] Pas de XSS

---

## Étape 7 — Welcome screen

### Pre-check
- [ ] Étape 6 validée

### Tâches
- **7.1** `WelcomeScreen.tsx` :
  - Icône ★ + titre "Letta Code"
  - Sous-titre : modèle actif + état connexion
  - 3 suggestions cliquables : "Explique-moi ce projet", "Quels fichiers dans ce workspace ?", "Aide-moi à corriger un bug"
  - Clic suggestion → appelle `handleSend(text)`
- **7.2** Intégrer dans `ChatView.tsx` : afficher si `messages.length === 0`

### Test
- [ ] Welcome screen au premier lancement
- [ ] Modèle affiché
- [ ] Clic suggestion → message envoyé, welcome disparaît

### Validation
- [ ] Visuellement cohérent avec le thème VSCode

---

## Étape 8 — Status bar

### Pre-check
- [ ] Étape 7 validée

### Tâches
- **8.1** `src/providers/statusBar.ts` : StatusBarManager
  - StatusBarItem aligné gauche, commande `letta-code.focus`
  - `update(model)` → texte `★ Letta: <model>`
  - `dispose()`
- **8.2** Intégrer dans `extension.ts` : instancier, écouter `session-ready` → update

### Test
- [ ] Item affiché : "★ Letta: Initialisation..." puis "★ Letta: claude-sonnet-4.5"
- [ ] Clic → focus sidebar
- [ ] Disparaît à la désactivation

### Validation
- [ ] Status bar synchronisé avec la session

---

## Étape 9 — Gestion d'erreurs et restart

### Pre-check
- [ ] Étape 8 validée

### Tâches
- **9.1** Commande `letta-code.restart` dans `extension.ts`
- **9.2** Crash recovery dans LettaService : si code ≠ 0, 3 tentatives auto (délai 3s), puis notification
- **9.3** Notification CLI absent : message + bouton "Installer" → ouvre docs.letta.com
- **9.4** Afficher les erreurs dans la webview (message système rouge)

### Test
- [ ] Restart via Command Palette → session relancée
- [ ] CLI crash → restart auto
- [ ] 3 crashes → notification "CLI ne répond pas"
- [ ] CLI absent → notification avec bouton
- [ ] Erreurs affichées proprement dans le chat

### Validation
- [ ] Aucun crash non géré
- [ ] L'utilisateur comprend toujours ce qui se passe

---

## Étape 10 — CI/CD et packaging

### Pre-check
- [ ] Étape 9 validée, tout fonctionne

### Tâches
- **10.1** `.github/workflows/ci.yml` : checkout, pnpm, node 20, compile, lint, build-webview, test
- **10.2** ESLint config (`eslint.config.mjs`)
- **10.3** `.vscodeignore` : exclure src/**, webview-ui/src/**, etc.
- **10.4** Script `package` : compile + build-webview + `vsce package --no-dependencies`
- **10.5** README final : description, screenshot placeholder, installation dev, prérequis, lien Letta

### Test
- [ ] GitHub Actions au vert
- [ ] `pnpm run package` → `.vsix` généré
- [ ] `.vsix` s'installe dans VSCode propre
- [ ] Extension fonctionne depuis le `.vsix`

### Validation finale
- [ ] **22 critères de validation** (spec §5) tous remplis
- [ ] Code clean, pas de TODO/hack
- [ ] README à jour
- [ ] Dépôt GitHub public
- [ ] Tag `v0.1.0` créé

---

## Résumé

| # | Étape | Estimation |
|---|---|---|
| 0 | Scaffolding | 2-3h |
| 1 | Extension minimale | 1h |
| 2 | Webview sidebar | 2-3h |
| 3 | Communication bidirectionnelle | 1-2h |
| 4 | LettaService (wrapper CLI) | 4-6h |
| 5 | Chat UI + câblage complet | 4-6h |
| 6 | Markdown & code blocks | 3-4h |
| 7 | Welcome screen | 1-2h |
| 8 | Status bar | 1h |
| 9 | Erreurs & restart | 2h |
| 10 | CI/CD & packaging | 2-3h |
| **Total** | | **~3-4 jours** |

---

## Template pour les features suivantes

```markdown
## Feature X — [Nom]

### Pre-check
- [ ] Module de base validé (ou feature précédente)
- [ ] [Prérequis spécifiques]

### Tâches
- **X.1** [Tâche atomique]
- **X.2** [Tâche atomique]

### Tests
- **X.T1** [Test unitaire]
- **X.T2** [Test d'intégration]

### Validation
- [ ] [Critère]
- [ ] Pas de régression sur les features existantes
```
