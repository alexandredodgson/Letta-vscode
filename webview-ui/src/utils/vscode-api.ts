import type { WebviewApi } from 'vscode-webview';

/**
 * A utility class to manage the VS Code Webview API.
 */
class VSCodeAPI {
    private readonly vscode: WebviewApi<unknown> | undefined;

    constructor() {
        if (typeof acquireVsCodeApi === 'function') {
            this.vscode = acquireVsCodeApi();
        }
    }

    /**
     * Post a message to the extension backend.
     */
    public postMessage(message: any) {
        if (this.vscode) {
            this.vscode.postMessage(message);
        } else {
            console.log('VSCode API not available, message:', message);
        }
    }

    /**
     * Get the state of the webview.
     */
    public getState(): any {
        return this.vscode?.getState();
    }

    /**
     * Set the state of the webview.
     */
    public setState(state: any) {
        this.vscode?.setState(state);
    }
}

export const vscode = new VSCodeAPI();
