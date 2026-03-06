import * as vscode from 'vscode';
import { LettaService } from '../letta/lettaService';

export class ChatProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'letta-code.chatView';
    private _view?: vscode.WebviewView;
    private _lettaService?: LettaService;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public setLettaService(lettaService: LettaService) {
        this._lettaService = lettaService;
        this._setupListeners();
    }

    private _setupListeners() {
        if (!this._lettaService) return;

        this._lettaService.on('session-ready', (event) => {
            this.postToWebview({ type: 'status', status: 'connected', model: event.model });
        });

        this._lettaService.on('message-delta', (delta, messageId) => {
            this.postToWebview({ type: 'message-delta', delta, messageId });
        });

        this._lettaService.on('message-complete', (content, messageId) => {
            this.postToWebview({ type: 'message-complete', content, messageId });
        });

        this._lettaService.on('error', (err) => {
            this.postToWebview({ type: 'status', status: 'error', error: err.message });
        });
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'ready':
                    if (this._lettaService?.isReady()) {
                        this.postToWebview({ type: 'status', status: 'connected' });
                    } else {
                        this.postToWebview({ type: 'status', status: 'initializing' });
                    }
                    break;
                case 'sendMessage':
                    if (this._lettaService) {
                        this._lettaService.sendMessage(data.text);
                    }
                    break;
                case 'interrupt':
                    if (this._lettaService) {
                        this._lettaService.interrupt();
                    }
                    break;
            }
        });
    }

    public postToWebview(message: any) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview-ui', 'assets', 'index.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview-ui', 'assets', 'index.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; font-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
                <link href="${styleUri}" rel="stylesheet">
                <title>Letta Chat</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
