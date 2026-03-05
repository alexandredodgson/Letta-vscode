import * as vscode from 'vscode';

export class StatusBarManager {
    private _statusBarItem: vscode.StatusBarItem;

    constructor() {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this._statusBarItem.command = 'letta-code.focus';
        this._statusBarItem.text = '$(sparkle) Letta: Initialisation...';
        this._statusBarItem.show();
    }

    public update(model: string) {
        this._statusBarItem.text = `$(sparkle) Letta: ${model}`;
    }

    public dispose() {
        this._statusBarItem.dispose();
    }
}
