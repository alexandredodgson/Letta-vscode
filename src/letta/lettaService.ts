import * as child_process from 'child_process';
import { EventEmitter } from 'events';
import { EventHandler, EventHandlerCallbacks } from './eventHandler';
import { LettaInitEvent, LettaResultEvent, SessionOptions } from './protocol';

export class LettaService extends EventEmitter {
    private process: child_process.ChildProcess | null = null;
    private eventHandler: EventHandler;
    private ready: boolean = false;
    private stdoutBuffer: string = '';
    private retryCount: number = 0;
    private maxRetries: number = 3;
    private lastArgs: string[] = [];
    private lastEnv: NodeJS.ProcessEnv | undefined;

    constructor() {
        super();
        this.eventHandler = new EventHandler(this.getCallbacks());
    }

    private getCallbacks(): EventHandlerCallbacks {
        return {
            onSessionReady: (event: LettaInitEvent) => {
                this.ready = true;
                this.retryCount = 0; // Reset on success
                this.emit('session-ready', event);
            },
            onMessageDelta: (delta: string, messageId: string) => {
                this.emit('message-delta', delta, messageId);
            },
            onMessageComplete: (content: string, messageId: string) => {
                this.emit('message-complete', content, messageId);
            },
            onTaskComplete: (event: LettaResultEvent) => {
                this.emit('task-complete', event);
            },
            onError: (message: string) => {
                this.emit('error', { message });
            },
            onRawEvent: (event: any) => {
                this.emit('raw-event', event);
            }
        };
    }

    public async startSession(args: string[], env?: NodeJS.ProcessEnv): Promise<void> {
        this.lastArgs = args;
        this.lastEnv = env;

        if (this.process) {
            await this.stopSession();
        }

        return new Promise((resolve, reject) => {
            try {
                this.process = child_process.spawn('letta', args, { env });

                const timeout = setTimeout(() => {
                    if (!this.ready) {
                        this.stopSession();
                        reject(new Error('Letta session initialization timed out (15s)'));
                    }
                }, 15000);

                this.process.stdout?.on('data', (data) => {
                    this.stdoutBuffer += data.toString();
                    const lines = this.stdoutBuffer.split('\n');
                    this.stdoutBuffer = lines.pop() || '';

                    for (const line of lines) {
                        this.eventHandler.parseLine(line);
                    }
                });

                this.process.stderr?.on('data', (data) => {
                    const errorMsg = data.toString();
                    console.error('Letta CLI stderr:', errorMsg);
                    this.emit('raw-stderr', errorMsg);
                });

                this.process.on('close', (code) => {
                    this.ready = false;
                    this.process = null;
                    this.emit('session-closed', { code });

                    if (code !== 0 && code !== null && this.retryCount < this.maxRetries) {
                        this.retryCount++;
                        console.log(`Letta CLI crashed (code ${code}). Retrying (${this.retryCount}/${this.maxRetries}) in 3s...`);
                        setTimeout(() => this.startSession(this.lastArgs, this.lastEnv), 3000);
                    } else if (code !== 0 && code !== null) {
                        this.emit('error', { message: 'Letta CLI ne répond pas après plusieurs tentatives.' });
                    }
                });

                this.process.on('error', (err: any) => {
                    if (err.code === 'ENOENT') {
                        this.emit('error', { message: 'CLI Letta non trouvé. Veuillez l\'installer via: npm install -g @letta-ai/letta-code' });
                    }
                    reject(err);
                });

                this.once('session-ready', () => {
                    clearTimeout(timeout);
                    resolve();
                });

            } catch (err) {
                reject(err);
            }
        });
    }

    public sendMessage(text: string) {
        if (!this.process || !this.process.stdin) {
            throw new Error('Letta session is not running');
        }

        const input = JSON.stringify({ type: 'user_input', text }) + '\n';
        this.process.stdin.write(input);
    }

    public interrupt() {
        if (this.process) {
            this.process.kill('SIGINT');
        }
    }

    public async stopSession(): Promise<void> {
        if (this.process) {
            this.process.removeAllListeners('close');
            this.process.kill();
            this.process = null;
            this.ready = false;
        }
    }

    public isReady(): boolean {
        return this.ready;
    }
}
