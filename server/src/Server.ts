import express, { Express } from 'express';
import http, { createServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { PluginInitializer } from './PluginInitializer';
import { Users } from './Users';
import { EPluginEvents } from './Plugins';

export class Server {
    private httpServer: http.Server;
    private app: Express;
    private io: SocketServer;
    private port;
    private pluginInitializer: PluginInitializer;

    public async init(): Promise<this> {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new SocketServer(this.httpServer, {
            /* options */
        });

        this.pluginInitializer = new PluginInitializer(this.io, this.app);

        this.io.on('connection', (socket) => {
            this.registerListeners(socket);
        });

        this.port = Number(process.env.PORT) || 3113;

        return this;
    }

    public async start(): Promise<this> {
        await new Promise((resolve) => {
            this.httpServer.listen(this.port, () => {
                console.log(`server listen on port ${this.port}`);
                resolve(null);
            });
        });
        return this;
    }

    private registerListeners(socket: Socket) {
        // socket.use((pReq, next) => {
        //     const req = [...pReq];
        //     console.log(req.shift(), 'called with', ...req);
        //     next();
        // });
        //init pong response
        socket.on('ping', () => {
            socket.emit('pong');
        });

        socket.on('disconnect', () => {
            this.unregisterListeners(socket);
            this.pluginInitializer.handleEvent(EPluginEvents.DISCONNECTION, socket);
        });

        //create a user with this id
        Users.createNew(socket);

        this.pluginInitializer.addToSocket(socket);
        this.pluginInitializer.handleEvent(EPluginEvents.CONNECTION, socket);
    }

    private unregisterListeners(socket: Socket) {
        socket.removeAllListeners();
    }
}
