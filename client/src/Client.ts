import {io, Socket} from "socket.io-client";

export class Client {
    private serverUrl: string;
    private socket: Socket;


    private readonly pingInterval = 5 * 1000; // 5s
    private pingTimer?: number;
    private pingStart?: Date;

    /**
     * init the client
     */
    public async init(): Promise<this> {
        this.serverUrl = process.env.CHAT_SERVER || 'http://localhost:3113'

        return this;
    }

    public async start(): Promise<this> {
        this.socket = io(this.serverUrl);
        //start the ping loop
        this.pingLoop();

        return this;
    }

    public pingLoop() {
        //if fn called but timer already started
        if(this.pingTimer) {
            clearTimeout(this.pingTimer);
        }

        //if socket is closed
        if(!this.socket.active) {
            clearTimeout(this.pingTimer);
            return;
        }

        this.socket.once('pong', () => {
            console.log('receive pong');
            if(!this.pingStart) {
                return;
            }

            const timing = Date.now() - this.pingStart.getTime();
            console.log('emit ping_result : ', timing);

            //send ping timing to the server, for stats
            this.socket.emit('ping_result', timing);
        });

        console.log('emit ping');
        this.pingStart = new Date();
        this.socket.emit('ping');

        //in some node version / configuration, setTimeout return a specific node object
        this.pingTimer = setTimeout(() => this.pingLoop(), this.pingInterval) as unknown as number
    }
}
