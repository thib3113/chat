import { io, Socket } from 'socket.io-client';
import repl, { REPLServer } from 'repl';
import chalk from 'chalk';
import { escapeRegex } from './utils';
import { IMessage } from './IMessage';

export class Client {
    private serverUrl: string;
    private socket: Socket;

    private readonly pingInterval = 5 * 1000; // 5s
    private pingTimer?: number;
    private pingStart?: Date;

    private currentNickName?: string;
    private REPLServer: REPLServer;

    /**
     * init the client
     */
    public async init(): Promise<this> {
        this.serverUrl = process.env.CHAT_SERVER || 'http://localhost:3113';

        return this;
    }

    public async start(): Promise<this> {
        this.socket = io(this.serverUrl);
        //start the ping loop
        this.pingLoop();

        this.socket.on('set_nickname', (nickName: string) => {
            this.currentNickName = nickName;
        });

        // client-side
        this.socket.on('connect', () => {
            if (this.currentNickName) {
                //send nick command automatically
                this.socket.emit('cmd', `/nick ${this.currentNickName}`);
            } else {
                console.log(chalk.bold('============================'));
                console.log(
                    chalk.bold(`Welcome on this chat, please use the command /nick to set a nickName . Or use /help to show the help`)
                );
                console.log(chalk.bold('============================'));
            }
        });

        //add msg listener
        this.socket.on('msg', (msg: IMessage) => {
            const defaultFn = (str) => str;
            const colorFn = chalk[msg.user_color] ?? defaultFn;
            //username
            const username = `${colorFn(msg.user)}`;

            let text = msg.msg;

            if (this.currentNickName) {
                text = text.replace(new RegExp(`@${escapeRegex(this.currentNickName || '')}`, 'g'), chalk.bold(`@${this.currentNickName}`));
            }

            console.log(`${username} : ${text}`);
        });

        //start the REPL console
        this.REPLServer = repl.start({
            prompt: '',
            eval: this.getREPLHandler()
        });

        return this;
    }

    public pingLoop() {
        //if fn called but timer already started
        if (this.pingTimer) {
            clearTimeout(this.pingTimer);
        }

        //if socket is closed
        if (!this.socket.active) {
            clearTimeout(this.pingTimer);
            return;
        }

        if (this.socket.connected) {
            this.socket.once('pong', () => {
                if (!this.pingStart) {
                    return;
                }

                const timing = Date.now() - this.pingStart.getTime();

                //send ping timing to the server, for stats
                this.socket.emit('ping_result', timing);
            });

            this.pingStart = new Date();
            this.socket.emit('ping');
        }

        //in some node version / configuration, setTimeout return a specific node object
        this.pingTimer = setTimeout(() => this.pingLoop(), this.pingInterval) as unknown as number;
    }

    private getREPLHandler(): (cmd: string) => void {
        return (pCmd) => {
            //only trimEnd so we can start with space + / (to bypass starting by /)
            const cmd = pCmd.trimEnd();
            //check if it's not an empty message
            if (cmd) {
                //it is a cmd or a message ?
                if (cmd.substring(0, 1) === '/') {
                    this.socket.emit('cmd', cmd);
                } else {
                    this.socket.emit('msg', cmd);
                }
            }
        };
    }
}
