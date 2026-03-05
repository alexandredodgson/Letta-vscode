import * as vscode from 'vscode';

export interface LettaConfig {
    model: string;
    agentId?: string;
    permissionMode: string;
}

export class ConfigManager {
    constructor(private context: vscode.ExtensionContext) {}

    public getConfig(): LettaConfig {
        const config = vscode.workspace.getConfiguration('letta-code');
        return {
            model: config.get<string>('model') || 'claude-sonnet-4.5',
            permissionMode: config.get<string>('permissionMode') || 'default',
            agentId: this.context.globalState.get<string>('letta-agent-id')
        };
    }

    public setAgentId(agentId: string) {
        this.context.globalState.update('letta-agent-id', agentId);
    }

    public getCliArgs(): string[] {
        const config = this.getConfig();
        const args = [
            '--output-format', 'stream-json',
            '--input-format', 'stream-json',
            '--model', config.model,
            '--permission-mode', config.permissionMode
        ];

        if (config.agentId) {
            args.push('--agent-id', config.agentId);
        }

        return args;
    }

    public getEnv(): NodeJS.ProcessEnv {
        return {
            ...process.env,
            // Ensure LETTA_API_KEY is passed if available in VSCode secrets or environment
        };
    }
}
