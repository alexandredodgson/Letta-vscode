import * as vscode from 'vscode';
import { ChatProvider } from './providers/chatProvider';
import { LettaService } from './letta/lettaService';
import { ConfigManager } from './letta/config';
import { StatusBarManager } from './providers/statusBar';

export async function activate(context: vscode.ExtensionContext) {
    const lettaService = new LettaService();
    const configManager = new ConfigManager(context);
    const provider = new ChatProvider(context.extensionUri);
    const statusBar = new StatusBarManager();

    provider.setLettaService(lettaService);

    lettaService.on('session-ready', (event) => {
        statusBar.update(event.model);
    });

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ChatProvider.viewType, provider),
        statusBar
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('letta-code.focus', () => {
            vscode.commands.executeCommand('letta-code.chatView.focus');
        }),
        vscode.commands.registerCommand('letta-code.restart', async () => {
            try {
                const args = configManager.getCliArgs();
                const env = configManager.getEnv();
                await lettaService.startSession(args, env);
                vscode.window.showInformationMessage('Letta session restarted successfully');
            } catch (err: any) {
                vscode.window.showErrorMessage('Failed to restart Letta session: ' + err.message);
            }
        })
    );

    try {
        const args = configManager.getCliArgs();
        const env = configManager.getEnv();
        await lettaService.startSession(args, env);
    } catch (err: any) {
        vscode.window.showErrorMessage('Failed to start Letta session: ' + err.message);
    }
}

export function deactivate() {}
