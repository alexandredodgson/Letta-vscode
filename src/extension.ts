import * as vscode from 'vscode';
import { ChatProvider } from './providers/chatProvider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new ChatProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ChatProvider.viewType, provider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('letta-code.focus', () => {
            vscode.commands.executeCommand('letta-code.chatView.focus');
        })
    );
}

export function deactivate() {}
